import type { Context, Next } from "hono";
import { db } from "../db/index.js";
import { operationLogs } from "@forge/shared";

// 定义敏感数据过滤字段
const sensitiveKeys = ["password", "token", "refreshToken", "oldPassword", "newPassword"];

// 过滤敏感数据
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

// 获取操作模块与动作名称
const getModuleAndAction = (method: string, path: string): { module: string; action: string } => {
  const cleanPath = path.split("?")[0].replace(/^\/api\//, "");
  const segments = cleanPath.split("/");
  const base = segments[0];

  let module = "未知模块";
  let action = `${method} ${path}`;

  switch (base) {
    case "auth":
      module = "安全认证";
      if (cleanPath.includes("login")) action = "用户登录";
      else if (cleanPath.includes("register")) action = "用户注册";
      else if (cleanPath.includes("refresh-token")) action = "刷新Token";
      else if (cleanPath.includes("logout")) action = "退出登录";
      break;
    case "user":
      module = "用户管理";
      if (method === "POST") action = "新增用户";
      else if (method === "PUT") action = "修改用户";
      else if (method === "DELETE") action = "删除用户";
      break;
    case "role":
      module = "角色管理";
      if (method === "POST") action = "新增角色";
      else if (method === "PUT") action = "修改角色";
      else if (method === "DELETE") action = "删除角色";
      break;
    case "permission":
      module = "权限管理";
      if (method === "POST") action = "新增权限";
      else if (method === "PUT") action = "修改权限";
      else if (method === "DELETE") action = "删除权限";
      break;
  }

  return { module, action };
};

// 操作审计日志中间件
export const operationLogMiddleware = async (c: Context, next: Next) => {
  // 只拦截 POST, PUT, DELETE 这种修改状态的敏感写操作
  const method = c.req.method;
  if (method === "GET" || method === "OPTIONS" || method === "HEAD") {
    return await next();
  }

  const path = c.req.path;
  const startTime = Date.now();

  // 1. 解析请求入参，进行脱敏
  let requestParams: any = null;
  try {
    const query = c.req.query();
    let body: any = null;

    // 检查是否有 json body
    const contentType = c.req.header("Content-Type") || "";
    if (contentType.includes("application/json")) {
      const clonedReq = c.req.raw.clone();
      body = await clonedReq.json();
    }

    requestParams = {
      query: Object.keys(query).length > 0 ? query : undefined,
      body: body ? sanitizeBody(body) : undefined,
    };
  } catch {
    // 忽略解析失败
  }

  let errorMessage: string | null = null;

  try {
    await next();
  } catch (err: any) {
    errorMessage = err.message || String(err);
    throw err;
  } finally {
    const duration = Date.now() - startTime;
    const status = c.res.status;

    if (c.error) {
      errorMessage = c.error.message || String(c.error);
    }

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

    // 3. 提取操作人身份（支持已登录用户或登录接口中的用户名）
    const currentUser = c.get("currentUser");
    let userId = currentUser?.id || null;
    let username = currentUser?.username || null;
    let nickname = currentUser?.nickname || null;

    if (!username && path.includes("login") && requestParams?.body?.username) {
      username = requestParams.body.username;
    }

    const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || null;
    const { module, action } = getModuleAndAction(method, path);

    // 4. 异步写入 PostgreSQL 数据库的 operation_logs 表中
    try {
      await db.insert(operationLogs).values({
        userId,
        username,
        nickname,
        ip,
        method,
        url: c.req.url,
        module,
        action,
        requestParams: requestParams ? JSON.stringify(requestParams) : null,
        responseData,
        status,
        duration,
        errorMessage,
      });
    } catch (dbError) {
      // 容错处理：不因日志写入失败阻断主业务响应
      console.error("🚨 [Audit Log Error] 写入操作日志失败:", dbError);
    }
  }
};
