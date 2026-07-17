import type { Context, Next } from "hono";
import { db } from "../db/index.js";
import { accessLogs } from "@forge/shared";

// 系统访问日志中间件（入库保存）
export const accessLogMiddleware = async (c: Context, next: Next) => {
  const path = c.req.path;

  // 🚨 极其重要：过滤掉获取系统日志本身的 API 请求，避免发生查询日志时无限触发写入导致死循环！
  if (path.includes("/api/system-log") || path === "/favicon.ico") {
    return await next();
  }

  const startTime = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || null;
  const userAgent = c.req.header("user-agent") || null;

  try {
    await next();
  } finally {
    const duration = Date.now() - startTime;
    const status = c.res.status;

    // 获取当前登录用户
    const currentUser = c.get("currentUser");
    let userId = currentUser?.id || null;
    let username = currentUser?.username || null;

    // 若未登录且正在登录，尝试解出登录时的用户名
    if (!username && path.includes("login")) {
      try {
        const clonedReq = c.req.raw.clone();
        const body = (await clonedReq.json()) as any;
        if (body && body.username) {
          username = body.username as string;
        }
      } catch {}
    }

    // 异步插入数据库
    try {
      await db.insert(accessLogs).values({
        userId,
        username,
        ip,
        method,
        url,
        status,
        duration,
        userAgent,
      });
    } catch (dbError) {
      console.error("🚨 [Access Log Error] 写入数据库访问日志失败:", dbError);
    }
  }
};
