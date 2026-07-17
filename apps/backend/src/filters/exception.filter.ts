/**
 * 异常过滤器
 * 类似 NestJS 的 Exception Filter，用于统一处理所有异常
 */

import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { env } from "../config.js";
import { logger } from "../logger.js";
import { getDbErrorInfo } from "../constants/pg-errors.js";
import { isAppError, ERROR_CODES } from "../constants/index.js";

/**
 * 敏感字段列表，需要在日志中脱敏
 */
const SENSITIVE_KEYS = ["password", "token", "refreshToken", "oldPassword", "newPassword"];

/**
 * 脱敏请求体中的敏感字段
 */
async function sanitizeRequestBody(c: Context): Promise<any> {
  let requestBody: any = null;
  try {
    // 优先尝试从 Hono 校验缓存中读取，若无则 clone 原始请求进行解析
    requestBody = (c.req as any).valid("json");
    if (!requestBody) {
      const clonedReq = c.req.raw.clone();
      requestBody = await clonedReq.json();
    }

    if (requestBody && typeof requestBody === "object") {
      requestBody = { ...requestBody };
      for (const key of SENSITIVE_KEYS) {
        if (key in requestBody) {
          requestBody[key] = "******";
        }
      }
    }
  } catch {
    // 忽略解析失败（可能无 body 或不是 JSON）
  }
  return requestBody;
}

/**
 * 全局异常过滤器
 * 统一处理所有错误，记录日志并返回友好的错误响应
 */
export async function globalExceptionFilter(err: Error, c: Context) {
  console.error("🚨 Hono error occurred:", err);

  const reqId = c.get("reqId") || "N/A";

  // 1. 处理 AppError（自定义业务错误）
  if (isAppError(err)) {
    const { code, message, httpStatus, type } = err;

    logger.error(
      {
        reqId,
        method: c.req.method,
        url: c.req.url,
        errorCode: code,
        httpStatus,
        errorType: type,
        message,
        stack: err.stack,
      },
      `🚨 [业务错误] ${c.req.method} ${c.req.url} - 错误码: ${code} | 原因: ${message}`,
    );

    return c.json(
      {
        code,
        message,
        type,
        error: env.NODE_ENV === "development" ? err.stack : undefined,
      },
      httpStatus as any,
    );
  }

  // 2. 处理 HTTPException（Hono 框架错误）
  if (err instanceof HTTPException) {
    // 将 HTTP 状态码转换为对应的错误码
    let errorCode: number = ERROR_CODES.INTERNAL_SERVER_ERROR.code;

    switch (err.status) {
      case 400:
        errorCode = ERROR_CODES.BAD_REQUEST.code;
        break;
      case 401:
        errorCode = ERROR_CODES.UNAUTHORIZED.code;
        break;
      case 403:
        errorCode = ERROR_CODES.FORBIDDEN.code;
        break;
      case 404:
        errorCode = ERROR_CODES.NOT_FOUND.code;
        break;
      case 405:
        errorCode = ERROR_CODES.METHOD_NOT_ALLOWED.code;
        break;
      case 409:
        errorCode = ERROR_CODES.CONFLICT.code;
        break;
      case 429:
        errorCode = ERROR_CODES.TOO_MANY_REQUESTS.code;
        break;
      case 500:
        errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR.code;
        break;
      case 502:
        errorCode = ERROR_CODES.BAD_GATEWAY.code;
        break;
      case 503:
        errorCode = ERROR_CODES.SERVICE_UNAVAILABLE.code;
        break;
      case 504:
        errorCode = ERROR_CODES.GATEWAY_TIMEOUT.code;
        break;
    }

    logger.error(
      {
        reqId,
        method: c.req.method,
        url: c.req.url,
        httpStatus: err.status,
        errorCode,
        message: err.message,
      },
      `🚨 [HTTP 错误] ${c.req.method} ${c.req.url} - 状态码: ${err.status} | 错误码: ${errorCode} | 原因: ${err.message}`,
    );

    return c.json(
      {
        code: errorCode,
        message: err.message,
        error: env.NODE_ENV === "development" ? err.stack : undefined,
      },
      err.status as any,
    );
  }

  // 3. 处理数据库错误（PostgreSQL）
  const { isDbError, message: dbFriendlyMessage, code: pgCode } = getDbErrorInfo(err);

  if (isDbError) {
    const requestBody = await sanitizeRequestBody(c);

    // 将 PostgreSQL 错误码转换为数字（DB前缀 + 原错误码数字）
    const dbErrorCode = parseInt(`90000${pgCode}`); // 90000系列：数据库错误

    logger.error(
      {
        reqId,
        method: c.req.method,
        url: c.req.url,
        queryParams: c.req.query(),
        pathParams: c.req.param(),
        requestBody,
        pgCode,
        errorCode: dbErrorCode,
        errorMessage: dbFriendlyMessage,
        stack: err.stack,
      },
      `🚨 [数据库错误] ${c.req.method} ${c.req.url} - PostgreSQL错误码: ${pgCode} | 错误码: ${dbErrorCode} | 原因: ${dbFriendlyMessage}`,
    );

    return c.json(
      {
        code: dbErrorCode,
        message: dbFriendlyMessage,
        type: "DATABASE_ERROR",
        error: env.NODE_ENV === "development" ? err.stack : undefined,
      },
      400,
    );
  }

  // 4. 处理其他未知错误
  const requestBody = await sanitizeRequestBody(c);

  logger.error(
    {
      reqId,
      method: c.req.method,
      url: c.req.url,
      queryParams: c.req.query(),
      pathParams: c.req.param(),
      requestBody,
      errorName: err.name,
      errorMessage: err.message,
      stack: err.stack,
    },
    `🚨 [未知错误] ${c.req.method} ${c.req.url} - 错误类型: ${err.name} | 原因: ${err.message}`,
  );

  // 返回前端友好提示，开发环境附带堆栈
  return c.json(
    {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR.code,
      message: env.NODE_ENV === "development" ? err.message : "服务器异常，请稍后再试",
      type: "UNKNOWN_ERROR",
      error: env.NODE_ENV === "development" ? err.stack : undefined,
    },
    500,
  );
}
