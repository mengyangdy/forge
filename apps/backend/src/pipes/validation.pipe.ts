/**
 * 验证管道示例
 * 类似 NestJS 的 Pipe，用于数据验证和转换
 *
 * 使用示例：
 * app.use('/api/*', validationPipe(schema))
 */

import type { Context, Next } from "hono";
import { z } from "zod";

/**
 * 验证管道工厂函数
 * 创建一个验证中间件，用于验证请求体是否符合给定的 Zod schema
 */
export function validationPipe<T extends z.ZodTypeAny>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      c.set("validatedBody", validated);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            code: 400,
            message: "数据验证失败",
            errors: error.issues,
          },
          400,
        );
      }
      throw error;
    }
  };
}

/**
 * 参数转换管道示例
 * 将字符串参数转换为指定类型
 */
export function parseIntPipe(paramName: string) {
  return async (c: Context, next: Next) => {
    const param = c.req.param(paramName);
    if (param) {
      const parsed = parseInt(param, 10);
      if (isNaN(parsed)) {
        return c.json(
          {
            code: 400,
            message: `参数 ${paramName} 必须是有效的整数`,
          },
          400,
        );
      }
      c.set(`parsed_${paramName}`, parsed);
    }
    await next();
  };
}
