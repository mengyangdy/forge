import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { requirePermission } from "../../guards/index.js";
import { redis } from "../../db/redis.js";

const app = new OpenAPIHono();

// 挂载全局鉴权中间件
app.use("*", authMiddleware);

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

app.use("/list", requirePermission("sys:online:list"));
app.use("/kickout", requirePermission("sys:online:kickout"));

const routes = app
  .openapi(listRoute, async (c) => {
    const usernameFilter = c.req.query("username")?.toLowerCase();

    const keys = await scanOnlineKeys();
    const list: any[] = [];

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
              if (usernameFilter && !session.username.toLowerCase().includes(usernameFilter)) {
                continue;
              }
              list.push(session);
            } catch {}
          }
        }
      }
    }

    list.sort(
      (a, b) => new Date(b.lastActiveTime).getTime() - new Date(a.lastActiveTime).getTime(),
    );

    return c.json(
      {
        code: 0,
        data: list,
      },
      200,
    );
  })
  .openapi(kickoutRoute, async (c) => {
    const { userId } = c.req.valid("json");
    const currentUser = c.get("currentUser");

    if (userId === currentUser.id) {
      throw new Error("禁止强退当前登录账号本人");
    }

    await redis.del(`auth:online:${userId}`);
    await redis.del(`auth:refresh_token:${userId}`);
    await redis.del(`user:session:${userId}`);

    return c.json(
      {
        code: 0,
        message: `用户 ID ${userId} 已被强制退出登录并注销凭证`,
      },
      200,
    );
  });

export default routes;
