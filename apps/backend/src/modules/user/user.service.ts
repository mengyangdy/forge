import { db } from "../../db/index.js";
import { users, userToRoles, roles } from "@forge/shared";
import { eq, and, like, sql, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redis } from "../../db/redis.js";

export class UserService {
  async list(
    page: number,
    pageSize: number,
    filters: { username?: string; nickname?: string; status?: string },
  ) {
    const offset = (page - 1) * pageSize;

    // 1. 构建查询条件
    const whereClauses = [];
    if (filters.username) {
      whereClauses.push(like(users.username, `%${filters.username}%`));
    }
    if (filters.nickname) {
      whereClauses.push(like(users.nickname, `%${filters.nickname}%`));
    }
    if (filters.status) {
      whereClauses.push(eq(users.status, filters.status));
    }
    const where = and(...whereClauses);

    // 2. 查用户主表信息
    const userList = await db
      .select({
        id: users.id,
        username: users.username,
        nickname: users.nickname,
        avatar: users.avatar,
        status: users.status,
        departmentId: users.departmentId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(users.id);

    // 3. 查用户所分配的角色关联（采用 IN 分组，避免大表直接 Join 引起的笛卡尔积及分页偏移问题）
    const userIds = userList.map((u) => u.id);
    const userRolesList =
      userIds.length > 0
        ? await db
            .select({
              userId: userToRoles.userId,
              roleId: roles.id,
              roleCode: roles.code,
              roleName: roles.name,
            })
            .from(userToRoles)
            .innerJoin(roles, eq(userToRoles.roleId, roles.id))
            .where(inArray(userToRoles.userId, userIds))
        : [];

    // 4. 将角色列表分组挂载到对应的用户节点下
    const rolesMap = new Map<number, any[]>();
    for (const ur of userRolesList) {
      if (!rolesMap.has(ur.userId)) {
        rolesMap.set(ur.userId, []);
      }
      rolesMap.get(ur.userId)!.push({
        id: ur.roleId,
        code: ur.roleCode,
        name: ur.roleName,
      });
    }

    const listWithRoles = userList.map((u) => ({
      ...u,
      roles: rolesMap.get(u.id) || [],
    }));

    // 5. 统计总数
    const [countRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(where);
    const total = Number(countRes?.count || 0);

    return { list: listWithRoles, total };
  }

  async detail(id: number) {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        nickname: users.nickname,
        avatar: users.avatar,
        status: users.status,
        departmentId: users.departmentId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new Error("用户不存在");
    }

    // 获取角色列表
    const userRoles = await db
      .select({
        id: roles.id,
        code: roles.code,
        name: roles.name,
      })
      .from(userToRoles)
      .innerJoin(roles, eq(userToRoles.roleId, roles.id))
      .where(eq(userToRoles.userId, id));

    return {
      ...user,
      roles: userRoles,
      roleIds: userRoles.map((r) => r.id),
    };
  }

  async create(data: {
    username: string;
    password?: string;
    nickname?: string | null;
    status: string;
    departmentId: number;
    roleIds: number[];
  }) {
    const { password = "user123", roleIds, ...userData } = data;

    // 检查用户名冲突
    const [exists] = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username))
      .limit(1);
    if (exists) {
      throw new Error("用户名已被占用");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return await db.transaction(async (tx) => {
      // 1. 写入用户表
      const [newUser] = await tx
        .insert(users)
        .values({
          ...userData,
          password: hashedPassword,
        })
        .returning();

      // 2. 写入角色关联表
      if (roleIds.length > 0) {
        const values = roleIds.map((rId) => ({
          userId: newUser.id,
          roleId: rId,
        }));
        await tx.insert(userToRoles).values(values);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...safeUser } = newUser;
      return safeUser;
    });
  }

  async update(
    id: number,
    data: {
      nickname?: string | null;
      status: string;
      departmentId: number;
      roleIds: number[];
      password?: string;
    },
  ) {
    const { roleIds, password, ...userData } = data;

    // 内置超级管理员账号强制为 active 状态
    if (id === 1) {
      userData.status = "active";
    }

    const result = await db.transaction(async (tx) => {
      const updateFields: any = {
        ...userData,
        updatedAt: new Date(),
      };

      if (password) {
        updateFields.password = await bcrypt.hash(password, 10);
      }

      // 1. 更新用户基本信息
      const [updatedUser] = await tx
        .update(users)
        .set(updateFields)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new Error("用户修改失败，用户不存在");
      }

      // 2. 重新绑定角色映射
      await tx.delete(userToRoles).where(eq(userToRoles.userId, id));
      if (roleIds.length > 0) {
        const values = roleIds.map((rId) => ({
          userId: id,
          roleId: rId,
        }));
        await tx.insert(userToRoles).values(values);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...safeUser } = updatedUser;
      return safeUser;
    });

    // 3. 强力清除 Redis 用户 Session 缓存，迫使用户下一次请求重新查库加载最新角色与权限
    await redis.del(`user:session:${id}`);

    return result;
  }

  async delete(id: number) {
    if (id === 1) {
      throw new Error("内置超级管理员账号禁止删除");
    }

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) {
      throw new Error("该用户不存在");
    }

    // 强行清除 Redis 用户 Session 缓存
    await redis.del(`user:session:${id}`);

    // Drizzle 设置了 Cascade 级联删除，因此直接删除用户即可，userToRoles 关系会被 PG 引擎级联清理
    const [result] = await db.delete(users).where(eq(users.id, id)).returning();
    return result;
  }

  async deleteMany(ids: number[]) {
    if (ids.includes(1)) {
      throw new Error("内置超级管理员账号禁止删除");
    }
    return await db.transaction(async (tx) => {
      const results = [];
      for (const id of ids) {
        const [user] = await tx.select().from(users).where(eq(users.id, id)).limit(1);
        if (!user) {
          throw new Error(`用户不存在(ID: ${id})`);
        }
        await redis.del(`user:session:${id}`);
        const [result] = await tx.delete(users).where(eq(users.id, id)).returning();
        results.push(result);
      }
      return results;
    });
  }
}

export const userService = new UserService();
