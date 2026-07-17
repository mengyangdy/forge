import { db } from "../../db/index.js";
import { departments, users } from "@forge/shared";
import { and, eq, sql } from "drizzle-orm";
import { AppError, createBizError, ERROR_CODES, getDbErrorInfo } from "../../constants/index.js";

export class DepartmentService {
  async list() {
    // 连表查询部门信息以及负责人昵称
    const data = await db
      .select({
        id: departments.id,
        name: departments.name,
        parentId: departments.parentId,
        leaderUserId: departments.leaderUserId,
        status: departments.status,
        createdAt: departments.createdAt,
        updatedAt: departments.updatedAt,
        leaderName: users.nickname,
      })
      .from(departments)
      .leftJoin(users, eq(departments.leaderUserId, users.id))
      .orderBy(departments.id);

    return data;
  }

  async tree() {
    const list = await this.list();
    return this.buildTree(list, null);
  }

  private buildTree(nodes: any[], parentId: number | null): any[] {
    const branch: any[] = [];
    for (const node of nodes) {
      if (node.parentId === parentId) {
        const children = this.buildTree(nodes, node.id);
        const item = { ...node };
        if (children.length > 0) {
          item.children = children;
        }
        branch.push(item);
      }
    }
    return branch;
  }

  async detail(id: number) {
    const [dept] = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
    if (!dept) {
      throw new AppError(ERROR_CODES.DATA_NOT_FOUND, "部门不存在");
    }
    return dept;
  }

  async create(data: {
    name: string;
    parentId?: number | null;
    leaderUserId?: number | null;
    status?: string;
  }) {
    const name = data.name.trim();

    const [exists] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.name, name))
      .limit(1);

    if (exists) {
      throw createBizError.departmentAlreadyExists();
    }

    try {
      const [newDept] = await db
        .insert(departments)
        .values({
          name,
          parentId: data.parentId || null,
          leaderUserId: data.leaderUserId || null,
          status: data.status || "active",
        })
        .returning();
      return newDept;
    } catch (error: any) {
      const dbError = getDbErrorInfo(error);
      if (dbError.isDbError && dbError.code === "23505") {
        throw createBizError.departmentAlreadyExists();
      }
      throw error;
    }
  }

  async update(
    id: number,
    data: {
      name: string;
      parentId?: number | null;
      leaderUserId?: number | null;
      status?: string;
    },
  ) {
    await this.detail(id);

    const name = data.name.trim();

    const [exists] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(and(eq(departments.name, name), sql`${departments.id} != ${id}`))
      .limit(1);

    if (exists) {
      throw createBizError.departmentAlreadyExists();
    }

    try {
      const [updatedDept] = await db
        .update(departments)
        .set({
          name,
          parentId: data.parentId || null,
          leaderUserId: data.leaderUserId || null,
          status: data.status || "active",
          updatedAt: new Date(),
        })
        .where(eq(departments.id, id))
        .returning();
      return updatedDept;
    } catch (error: any) {
      const dbError = getDbErrorInfo(error);
      if (dbError.isDbError && dbError.code === "23505") {
        throw createBizError.departmentAlreadyExists();
      }
      throw error;
    }
  }

  async delete(id: number) {
    await this.detail(id);

    const [child] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.parentId, id))
      .limit(1);
    if (child) {
      throw createBizError.departmentHasChildren();
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.departmentId, id))
      .limit(1);
    if (user) {
      throw createBizError.departmentHasUsers();
    }

    const [deleted] = await db.delete(departments).where(eq(departments.id, id)).returning();
    return deleted;
  }

  async deleteMany(ids: number[]) {
    return await db.transaction(async (tx) => {
      const results = [];
      for (const id of ids) {
        const [dept] = await tx.select().from(departments).where(eq(departments.id, id)).limit(1);
        if (!dept) {
          throw new AppError(ERROR_CODES.DATA_NOT_FOUND, `部门不存在(ID: ${id})`);
        }

        const [child] = await tx
          .select({ id: departments.id })
          .from(departments)
          .where(eq(departments.parentId, id))
          .limit(1);
        if (child && !ids.includes(child.id)) {
          throw createBizError.departmentHasChildren();
        }

        const [user] = await tx
          .select({ id: users.id })
          .from(users)
          .where(eq(users.departmentId, id))
          .limit(1);
        if (user) {
          throw createBizError.departmentHasUsers();
        }

        const [deleted] = await tx.delete(departments).where(eq(departments.id, id)).returning();
        results.push(deleted);
      }
      return results;
    });
  }
}

export const departmentService = new DepartmentService();
