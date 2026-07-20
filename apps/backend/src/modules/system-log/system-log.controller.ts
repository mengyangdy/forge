import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { requirePermission } from "../../guards/index.js";
import { systemLogService } from "./system-log.service.js";

const app = new OpenAPIHono();

// 挂载全局登录鉴权中间件
app.use("*", authMiddleware);

// 1. 查询系统访问日志接口文档定义
const accessListRoute = createRoute({
  method: "get",
  path: "/access/list",
  summary: "查询系统访问日志",
  tags: ["系统日志 SystemLog"],
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      page: z.string().optional().default("1"),
      pageSize: z.string().optional().default("10"),
      username: z.string().openapi({ description: "用户名过滤" }).optional(),
      method: z.string().openapi({ description: "请求方式（GET/POST等）" }).optional(),
      status: z.string().openapi({ description: "状态码（如200/500）" }).optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.object({
              list: z.array(
                z.object({
                  id: z.number(),
                  userId: z.number().nullable(),
                  username: z.string().nullable(),
                  ip: z.string().nullable(),
                  method: z.string(),
                  url: z.string(),
                  requestParams: z.string().nullable(),
                  responseData: z.string().nullable(),
                  status: z.number(),
                  duration: z.number(),
                  userAgent: z.string().nullable(),
                  createdAt: z.string(),
                }),
              ),
              total: z.number(),
            }),
          }),
        },
      },
      description: "成功返回访问日志列表",
    },
  },
});

// 2. 查询系统操作日志接口文档定义
const operationListRoute = createRoute({
  method: "get",
  path: "/operation/list",
  summary: "查询业务操作日志",
  tags: ["系统日志 SystemLog"],
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      page: z.string().optional().default("1"),
      pageSize: z.string().optional().default("10"),
      username: z.string().openapi({ description: "操作人用户名" }).optional(),
      module: z.string().openapi({ description: "操作模块过滤" }).optional(),
      action: z.string().openapi({ description: "操作动作过滤" }).optional(),
      status: z.string().openapi({ description: "状态码" }).optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.object({
              list: z.array(
                z.object({
                  id: z.number(),
                  userId: z.number().nullable(),
                  username: z.string().nullable(),
                  nickname: z.string().nullable(),
                  ip: z.string().nullable(),
                  method: z.string(),
                  url: z.string(),
                  module: z.string().nullable(),
                  action: z.string().nullable(),
                  requestParams: z.string().nullable(),
                  responseData: z.string().nullable(),
                  status: z.number(),
                  duration: z.number(),
                  errorMessage: z.string().nullable(),
                  createdAt: z.string(),
                }),
              ),
              total: z.number(),
            }),
          }),
        },
      },
      description: "成功返回操作日志列表",
    },
  },
});

app.use("/access/list", requirePermission("sys:log:list"));
app.use("/operation/list", requirePermission("sys:log:list"));

const routes = app
  .openapi(accessListRoute, async (c) => {
    const page = Number(c.req.query("page") || 1);
    const pageSize = Number(c.req.query("pageSize") || 10);
    const username = c.req.query("username");
    const method = c.req.query("method");
    const statusStr = c.req.query("status");
    const status = statusStr ? Number(statusStr) : undefined;

    const result = await systemLogService.listAccessLogs(page, pageSize, {
      username,
      method,
      status,
    });
    return c.json(
      {
        code: 0,
        data: result,
      },
      200,
    );
  })
  .openapi(operationListRoute, async (c) => {
    const page = Number(c.req.query("page") || 1);
    const pageSize = Number(c.req.query("pageSize") || 10);
    const username = c.req.query("username");
    const module = c.req.query("module");
    const action = c.req.query("action");
    const statusStr = c.req.query("status");
    const status = statusStr ? Number(statusStr) : undefined;

    const result = await systemLogService.listOperationLogs(page, pageSize, {
      username,
      module,
      action,
      status,
    });

    return c.json(
      {
        code: 0,
        data: result,
      },
      200,
    );
  });

export default routes;
