import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { requirePermission } from "../../guards/index.js";
import { redis } from "../../db/redis.js";

const app = new OpenAPIHono();

// 挂载全局鉴权中间件
app.use("*", authMiddleware);

// 辅助方法：使用 SCAN 安全遍历 Redis 键，避免 KEYS 带来的进程阻塞风险
async function scanOnlineKeys(): Promise<string[]> {
  let cursor = "0";
  const keys: string[] = [];
  do {
    const reply = await redis.scan(cursor, "MATCH", "auth:online:*", "COUNT", 100);
    cursor = reply[0];
    keys.push(...reply[1]);
  } while (cursor !== "0");
  return keys;
}

// 1. 查询在线用户列表接口文档定义
app.use("/list", requirePermission("sys:online:list"));
const listRoute = createRoute({
  method: "get",
  path: "/list",
  summary: "查询在线用户列表",
  tags: ["在线用户 Online"],
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      username: z.string().openapi({ description: "用户名模糊过滤" }).optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.array(
              z.object({
                userId: z.number(),
                username: z.string(),
                nickname: z.string().nullable(),
                ip: z.string().nullable(),
                userAgent: z.string().nullable(),
                loginTime: z.string(),
                lastActiveTime: z.string(),
              }),
            ),
          }),
        },
      },
      description: "成功返回在线用户列表",
    },
  },
});

// 2. 强退用户接口文档定义
app.use("/kickout", requirePermission("sys:online:kickout"));
const kickoutRoute = createRoute({
  method: "post",
  path: "/kickout",
  summary: "强制退线 (踢人下线)",
  tags: ["在线用户 Online"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            userId: z.number().openapi({ description: "被强退的用户ID" }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            message: z.string(),
          }),
        },
      },
      description: "强退执行成功",
    },
  },
});

// 逻辑实现：查询在线用户列表
app.openapi(listRoute, async (c) => {
  const usernameFilter = c.req.query("username")?.toLowerCase();

  // 1. 扫描匹配 `auth:online:*` 的所有在线 Key
  const keys = await scanOnlineKeys();
  const list: any[] = [];

  // 2. 批量拉取在线会话 Session 详情
  if (keys.length > 0) {
    const pipeline = redis.pipeline();
    for (const key of keys) {
      pipeline.get(key);
    }
    const results = await pipeline.exec();

    if (results) {
      for (const [err, val] of results) {
        if (!err && val && typeof val === "string") {
          try {
            const session = JSON.parse(val);
            // 过滤条件
            if (usernameFilter && !session.username.toLowerCase().includes(usernameFilter)) {
              continue;
            }
            list.push(session);
          } catch {}
        }
      }
    }
  }

  // 排序：按活跃时间倒序
  list.sort((a, b) => new Date(b.lastActiveTime).getTime() - new Date(a.lastActiveTime).getTime());

  return c.json(
    {
      code: 0,
      data: list,
    },
    200,
  );
});

// 逻辑实现：强退用户
app.openapi(kickoutRoute, async (c) => {
  const { userId } = c.req.valid("json");
  const currentUser = c.get("currentUser");

  // 防呆设计：不允许管理员强退自己本身，防止当场暴毙
  if (userId === currentUser.id) {
    throw new Error("禁止强退当前登录账号本人");
  }

  // 1. 清除 Redis 在线状态锁 (使其 AccessToken 下一次请求直接被拦截抛 401)
  await redis.del(`auth:online:${userId}`);

  // 2. 清除 Redis 中的 RefreshToken 白名单
  await redis.del(`auth:refresh_token:${userId}`);

  // 3. 顺便清除权限缓存
  await redis.del(`user:session:${userId}`);

  return c.json(
    {
      code: 0,
      message: `用户 ID ${userId} 已被强制退出登录并注销凭证`,
    },
    200,
  );
});

export default app;
