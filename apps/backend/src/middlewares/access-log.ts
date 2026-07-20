import type { Context, Next } from "hono";
import { db } from "../db/index.js";
import { accessLogs } from "@forge/shared";

// 敏感字段过滤
const sensitiveKeys = ["password", "token", "refreshToken", "oldPassword", "newPassword"];
const sanitizeBody = (body: any) => {
  if (!body || typeof body !== "object") return body;
  const sanitized = { ...body };
  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = "******";
    }
  }
  return sanitized;
};

// 系统访问日志中间件（入库保存）
export const accessLogMiddleware = async (c: Context, next: Next) => {
  const path = c.req.path;

  // 🚨 过滤掉获取系统日志本身的 API 请求与静态图标
  if (path.includes("/api/system-log") || path === "/favicon.ico") {
    return await next();
  }

  const startTime = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || null;
  const userAgent = c.req.header("user-agent") || null;

  // 1. 提取请求入参
  let requestParams: any = null;
  try {
    const query = c.req.query();
    let body: any = null;
    const contentType = c.req.header("Content-Type") || "";
    if (contentType.includes("application/json")) {
      const clonedReq = c.req.raw.clone();
      body = await clonedReq.json();
    }
    requestParams = {
      query: Object.keys(query).length > 0 ? query : undefined,
      body: body ? sanitizeBody(body) : undefined,
    };
  } catch {}

  try {
    await next();
  } finally {
    const duration = Date.now() - startTime;
    const status = c.res.status;

    // 2. 提取响应反参 (Response Data)
    let responseData: string | null = null;
    if (c.res) {
      try {
        const clonedRes = c.res.clone();
        const resText = await clonedRes.text();
        responseData =
          resText.length > 5000 ? `${resText.substring(0, 5000)}... [已截断]` : resText;
      } catch {}
    }

    // 获取当前登录用户
    const currentUser = c.get("currentUser");
    let userId = currentUser?.id || null;
    let username = currentUser?.username || null;

    // 若未登录且正在登录，尝试解出登录时的用户名
    if (!username && path.includes("login") && requestParams?.body?.username) {
      username = requestParams.body.username;
    }

    // 异步插入数据库
    try {
      await db.insert(accessLogs).values({
        userId,
        username,
        ip,
        method,
        url,
        requestParams: requestParams ? JSON.stringify(requestParams) : null,
        responseData,
        status,
        duration,
        userAgent,
      });
    } catch (dbError) {
      console.error("🚨 [Access Log Error] 写入数据库访问日志失败:", dbError);
    }
  }
};
