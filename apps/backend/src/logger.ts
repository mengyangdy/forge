import pino from "pino";
import { env } from "./config.js";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

// 结构化日志追踪中间件
export const loggerMiddleware = async (c: any, next: any) => {
  const reqId = crypto.randomUUID();
  c.set("reqId", reqId);

  const startTime = Date.now();
  logger.info(
    {
      reqId,
      method: c.req.method,
      url: c.req.url,
      ip: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
    },
    `📥 [Hono] 收到请求: ${c.req.method} ${c.req.url}`,
  );

  await next();

  const duration = Date.now() - startTime;
  logger.info(
    {
      reqId,
      status: c.res.status,
      duration: `${duration}ms`,
    },
    `📤 [Hono] 请求完成: ${c.req.method} ${c.req.url} - 状态码: ${c.res.status} | 耗时: ${duration}ms`,
  );
};
