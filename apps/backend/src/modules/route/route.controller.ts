import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { routeService } from "./route.service.js";
import { HTTPException } from "hono/http-exception";

const app = new OpenAPIHono();

// 必须鉴权
app.use("*", authMiddleware);

const getReactUserRoutesRoute = createRoute({
  method: "get",
  path: "/getReactUserRoutes",
  summary: "获取当前登录用户的动态路由树",
  tags: ["路由模块 Route"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.object({
              home: z.string().nullable().optional(),
              routes: z.array(z.any()),
            }),
          }),
        },
      },
      description: "成功返回动态路由数据",
    },
  },
});

const routes = app.openapi(getReactUserRoutesRoute, async (c) => {
  const currentUser = c.get("currentUser");
  if (!currentUser) {
    throw new HTTPException(401, { message: "未登录或登录状态已失效" });
  }

  const result = await routeService.getUserRoutes(currentUser.id);
  return c.json(
    {
      code: 0,
      data: result,
    },
    200,
  );
});

export default routes;
