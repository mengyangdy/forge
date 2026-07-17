/**
 * 响应拦截器
 * 类似 NestJS 的 Interceptor，用于统一处理响应格式
 */

import type { Context, Next } from "hono";
import { SUCCESS_CODE } from "../constants/error-codes.js";

/**
 * 响应拦截器中间件
 * 为每个请求的 context 添加 ok/fail 辅助方法
 * 注意：Context 类型扩展在 src/types/hono.d.ts 中定义
 */
export async function responseInterceptor(c: Context, next: Next) {
  c.ok = (data, message = "操作成功") => {
    return c.json({
      code: SUCCESS_CODE,
      message,
      data,
    });
  };

  c.fail = (message: string, status: any = 400) => {
    return c.json(
      {
        code: status,
        message,
      },
      status as any,
    );
  };

  await next();
}
