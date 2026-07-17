import { db } from "../../db/index.js";
import { accessLogs, operationLogs } from "@forge/shared";
import { eq, and, like, sql, desc } from "drizzle-orm";

export class SystemLogService {
  // 1. 分页查询访问日志
  async listAccessLogs(
    page: number,
    pageSize: number,
    filters: { username?: string; method?: string; status?: number },
  ) {
    const offset = (page - 1) * pageSize;

    const whereClauses = [];
    if (filters.username) {
      whereClauses.push(like(accessLogs.username, `%${filters.username}%`));
    }
    if (filters.method) {
      whereClauses.push(eq(accessLogs.method, filters.method.toUpperCase()));
    }
    if (filters.status) {
      whereClauses.push(eq(accessLogs.status, filters.status));
    }
    const where = and(...whereClauses);

    // 查询日志列表，按时间倒序
    const list = await db
      .select()
      .from(accessLogs)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(accessLogs.createdAt));

    // 统计总数
    const [countRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(accessLogs)
      .where(where);
    const total = Number(countRes?.count || 0);

    return { list, total };
  }

  // 2. 分页查询操作审计日志
  async listOperationLogs(
    page: number,
    pageSize: number,
    filters: { username?: string; module?: string; action?: string; status?: number },
  ) {
    const offset = (page - 1) * pageSize;

    const whereClauses = [];
    if (filters.username) {
      whereClauses.push(like(operationLogs.username, `%${filters.username}%`));
    }
    if (filters.module) {
      whereClauses.push(like(operationLogs.module, `%${filters.module}%`));
    }
    if (filters.action) {
      whereClauses.push(like(operationLogs.action, `%${filters.action}%`));
    }
    if (filters.status) {
      whereClauses.push(eq(operationLogs.status, filters.status));
    }
    const where = and(...whereClauses);

    // 查询操作日志，按时间倒序
    const list = await db
      .select()
      .from(operationLogs)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(operationLogs.createdAt));

    // 统计总数
    const [countRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(operationLogs)
      .where(where);
    const total = Number(countRes?.count || 0);

    return { list, total };
  }
}

export const systemLogService = new SystemLogService();
