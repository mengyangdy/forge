import { db } from "../../db/index.js";
import { roles, roleToPermissions, userToRoles, permissions } from "@forge/shared";
import { eq, sql, inArray } from "drizzle-orm";
import { redis } from "../../db/redis.js";

type RoleDataScope = "all" | "dept_child" | "dept" | "self" | "custom";
type RoleResponse = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  dataScope: RoleDataScope;
  createdAt: string;
  updatedAt: string;
};
type RoleResponseDetail = RoleResponse & {
  permissionIds: number[];
};

function toRoleResponse(role: {
  id: number;
  code: string;
  name: string;
  description: string | null;
  dataScope: string;
  createdAt: Date;
  updatedAt: Date;
}): RoleResponse {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description,
    dataScope: role.dataScope as RoleDataScope,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}

export class RoleService {
  // 缓存失效辅助函数：清除绑定了该角色的所有用户的 Redis Session 缓存
  private async clearUserSessionCache(roleId: number) {
    try {
      const affectedUsers = await db
        .select({ userId: userToRoles.userId })
        .from(userToRoles)
        .where(eq(userToRoles.roleId, roleId));

      for (const u of affectedUsers) {
        await redis.del(`user:session:${u.userId}`);
      }
    } catch (error) {
      console.error("[Cache Invalidation Error]:", error);
    }
  }

  // 补全所有子级权限所对应的父级目录/菜单 ID，防止前端 Tree 组件半选节点丢失导致树断裂
  private async resolveAllPermissionIds(permissionIds: number[]): Promise<number[]> {
    if (permissionIds.length === 0) return [];

    const allPermissions = await db
      .select({ id: permissions.id, parentId: permissions.parentId })
      .from(permissions);

    const permissionMap = new Map<number, number | null>();
    for (const p of allPermissions) {
      permissionMap.set(p.id, p.parentId);
    }

    const resolvedSet = new Set<number>(permissionIds);
    for (const id of permissionIds) {
      let currentId: number | null | undefined = id;
      while (currentId) {
        const parentId = permissionMap.get(currentId);
        if (parentId) {
          resolvedSet.add(parentId);
          currentId = parentId;
        } else {
          break;
        }
      }
    }

    return Array.from(resolvedSet);
  }

  async list(page?: number, pageSize?: number) {
    if (page && pageSize) {
      const offset = (page - 1) * pageSize;
      const data = await db.select().from(roles).limit(pageSize).offset(offset).orderBy(roles.id);

      const roleIds = data.map((r) => r.id);
      const permissionMap = new Map<number, number[]>();

      if (roleIds.length > 0) {
        const mappings = await db
          .select({
            roleId: roleToPermissions.roleId,
            permissionId: roleToPermissions.permissionId,
          })
          .from(roleToPermissions)
          .where(inArray(roleToPermissions.roleId, roleIds));

        for (const m of mappings) {
          if (!permissionMap.has(m.roleId)) {
            permissionMap.set(m.roleId, []);
          }
          permissionMap.get(m.roleId)!.push(m.permissionId);
        }
      }

      const list = data.map((role) => ({
        ...toRoleResponse(role),
        permissionIds: permissionMap.get(role.id) || [],
      }));

      const [countRes] = await db.select({ count: sql<number>`count(*)` }).from(roles);
      const total = Number(countRes?.count || 0);

      return { list, total };
    }

    // 若未传分页参数，默认返回全量列表（常用作下拉选择列表）
    const data = await db.select().from(roles).orderBy(roles.id);
    const roleIds = data.map((r) => r.id);
    const permissionMap = new Map<number, number[]>();

    if (roleIds.length > 0) {
      const mappings = await db
        .select({
          roleId: roleToPermissions.roleId,
          permissionId: roleToPermissions.permissionId,
        })
        .from(roleToPermissions)
        .where(inArray(roleToPermissions.roleId, roleIds));

      for (const m of mappings) {
        if (!permissionMap.has(m.roleId)) {
          permissionMap.set(m.roleId, []);
        }
        permissionMap.get(m.roleId)!.push(m.permissionId);
      }
    }

    const list = data.map((role) => ({
      ...toRoleResponse(role),
      permissionIds: permissionMap.get(role.id) || [],
    }));

    return { list, total: data.length };
  }

  async detail(id: number) {
    const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!role) {
      throw new Error("该角色不存在");
    }

    const permissionMappings = await db
      .select({ permissionId: roleToPermissions.permissionId })
      .from(roleToPermissions)
      .where(eq(roleToPermissions.roleId, id));

    const permissionIds = permissionMappings.map((m) => m.permissionId);

    return {
      ...toRoleResponse(role),
      permissionIds,
    } satisfies RoleResponseDetail;
  }

  async create(data: {
    code: string;
    name: string;
    description?: string | null;
    dataScope?: RoleDataScope;
    permissionIds?: number[];
  }) {
    const { permissionIds = [], ...roleData } = data;
    const resolvedPermissionIds = await this.resolveAllPermissionIds(permissionIds);

    return await db.transaction(async (tx) => {
      // 1. 插入角色基本信息
      const [newRole] = await tx.insert(roles).values(roleData).returning();

      // 2. 插入角色权限映射关系
      if (resolvedPermissionIds.length > 0) {
        const values = resolvedPermissionIds.map((pId) => ({
          roleId: newRole.id,
          permissionId: pId,
        }));
        await tx.insert(roleToPermissions).values(values);
      }

      return toRoleResponse(newRole);
    });
  }

  async update(
    id: number,
    data: {
      code: string;
      name: string;
      description?: string | null;
      dataScope?: RoleDataScope;
      permissionIds?: number[];
    },
  ) {
    const { permissionIds = [], ...roleData } = data;

    // 内置超级管理员角色不能修改标识码
    if (id === 1 || roleData.code === "ROLE_SUPER_ADMIN") {
      const [currentRole] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
      if (currentRole && currentRole.code !== roleData.code) {
        throw new Error("内置超级管理员角色标识不能被修改");
      }
    }

    const resolvedPermissionIds = await this.resolveAllPermissionIds(permissionIds);

    const result = await db.transaction(async (tx) => {
      // 1. 更新角色基本信息
      const [updatedRole] = await tx
        .update(roles)
        .set({ ...roleData, updatedAt: new Date() })
        .where(eq(roles.id, id))
        .returning();

      // 2. 清除原有角色权限映射
      await tx.delete(roleToPermissions).where(eq(roleToPermissions.roleId, id));

      // 3. 写入新的角色权限映射
      if (resolvedPermissionIds.length > 0) {
        const values = resolvedPermissionIds.map((pId) => ({
          roleId: id,
          permissionId: pId,
        }));
        await tx.insert(roleToPermissions).values(values);
      }

      return toRoleResponse(updatedRole);
    });

    // 4. 失效该角色下所有用户的 Redis 缓存
    await this.clearUserSessionCache(id);

    return result;
  }

  async delete(id: number) {
    const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!role) {
      throw new Error("该角色不存在");
    }

    if (role.code === "ROLE_SUPER_ADMIN") {
      throw new Error("系统内置超级管理员角色禁止删除");
    }

    // 清理该角色下所有关联用户的缓存
    await this.clearUserSessionCache(id);

    const [result] = await db.delete(roles).where(eq(roles.id, id)).returning();
    return toRoleResponse(result);
  }

  async deleteMany(ids: number[]) {
    return await db.transaction(async (tx) => {
      const results = [];
      for (const id of ids) {
        const [role] = await tx.select().from(roles).where(eq(roles.id, id)).limit(1);
        if (!role) {
          throw new Error(`角色不存在(ID: ${id})`);
        }
        if (role.code === "ROLE_SUPER_ADMIN") {
          throw new Error("系统内置超级管理员角色禁止删除");
        }
        await this.clearUserSessionCache(id);
        const [result] = await tx.delete(roles).where(eq(roles.id, id)).returning();
        results.push(toRoleResponse(result));
      }
      return results;
    });
  }
}

export const roleService = new RoleService();
