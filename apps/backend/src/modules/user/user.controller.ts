import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { requirePermission } from "../../guards/index.js";
import { userService } from "./user.service.js";
import { HTTPException } from "hono/http-exception";

const app = new OpenAPIHono();

// 所有用户接口需要登录校验
app.use("*", authMiddleware);

const createSchema = z.object({
  username: z.string().min(2, "用户名最少 2 个字符").max(50),
  password: z.string().min(6, "密码最少 6 位").optional(),
  nickname: z.string().nullable().optional(),
  status: z.enum(["active", "disabled"]),
  departmentId: z.number().int().positive("所属部门不能为空"),
  roleIds: z.array(z.number()),
});

const updateSchema = z.object({
  nickname: z.string().nullable().optional(),
  status: z.enum(["active", "disabled"]),
  departmentId: z.number().int().positive("所属部门不能为空"),
  roleIds: z.array(z.number()),
  password: z.string().min(6, "密码最少 6 位").optional().or(z.literal("")),
});

// 1. 查询用户列表
const listRoute = createRoute({
  method: "get",
  path: "/list",
  summary: "查询用户列表",
  tags: ["用户管理 User"],
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      page: z.string().optional().default("1"),
      pageSize: z.string().optional().default("10"),
      username: z.string().openapi({ description: "用户名模糊搜索" }).optional(),
      nickname: z.string().openapi({ description: "昵称模糊搜索" }).optional(),
      status: z.string().openapi({ description: "状态（active/disabled）" }).optional(),
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
                  username: z.string(),
                  nickname: z.string().nullable(),
                  avatar: z.string().nullable(),
                  status: z.string(),
                  departmentId: z.number(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                  roles: z.array(
                    z.object({
                      id: z.number(),
                      code: z.string(),
                      name: z.string(),
                    }),
                  ),
                }),
              ),
              total: z.number(),
            }),
          }),
        },
      },
      description: "成功返回用户列表",
    },
  },
});

// 2. 获取用户详情
const detailRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "获取用户详情",
  tags: ["用户管理 User"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "用户ID" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.object({
              id: z.number(),
              username: z.string(),
              nickname: z.string().nullable(),
              avatar: z.string().nullable(),
              status: z.string(),
              departmentId: z.number(),
              roleIds: z.array(z.number()),
              roles: z.array(z.any()),
            }),
          }),
        },
      },
      description: "成功返回用户详情",
    },
  },
});

// 3. 创建用户
const createRouteDoc = createRoute({
  method: "post",
  path: "/create",
  summary: "创建用户",
  tags: ["用户管理 User"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createSchema,
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
            data: z.any(),
          }),
        },
      },
      description: "创建成功",
    },
  },
});

// 4. 更新用户
const updateRouteDoc = createRoute({
  method: "put",
  path: "/{id}",
  summary: "更新用户",
  tags: ["用户管理 User"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "用户ID" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateSchema,
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
            data: z.any(),
          }),
        },
      },
      description: "修改成功",
    },
  },
});

// 5. 删除用户
const deleteRouteDoc = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "删除用户",
  tags: ["用户管理 User"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "用户ID" }),
    }),
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
      description: "删除成功",
    },
  },
});

// 6. 批量删除用户
const batchDeleteRouteDoc = createRoute({
  method: "post",
  path: "/batch-delete",
  summary: "批量删除用户",
  tags: ["用户管理 User"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            ids: z.array(z.number()),
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
      description: "批量删除成功",
    },
  },
});

app.use("/list", requirePermission("sys:user:list"));
app.use("/{id}", requirePermission("sys:user:list"));
app.use("/create", requirePermission("sys:user:create"));
app.on("PUT", ["/{id}"], requirePermission("sys:user:update"));
app.on("DELETE", ["/{id}"], requirePermission("sys:user:delete"));
app.use("/batch-delete", requirePermission("sys:user:delete"));

const routes = app
  .openapi(listRoute, async (c) => {
    const page = Number(c.req.query("page") || 1);
    const pageSize = Number(c.req.query("pageSize") || 10);
    const username = c.req.query("username");
    const nickname = c.req.query("nickname");
    const status = c.req.query("status");

    const result = await userService.list(page, pageSize, { username, nickname, status });
    return c.json(
      {
        code: 0,
        data: result,
      },
      200,
    );
  })
  .openapi(detailRoute, async (c) => {
    const id = Number(c.req.param("id"));
    try {
      const detail = await userService.detail(id);
      return c.json(
        {
          code: 0,
          data: detail,
        },
        200,
      );
    } catch (error: any) {
      throw new HTTPException(404, { message: error.message });
    }
  })
  .openapi(createRouteDoc, async (c) => {
    const data = c.req.valid("json");
    try {
      const result = await userService.create(data);
      return c.json(
        {
          code: 0,
          message: "用户创建成功",
          data: result,
        },
        200,
      );
    } catch (error: any) {
      throw new HTTPException(400, { message: error.message });
    }
  })
  .openapi(updateRouteDoc, async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");

    if (data.password === "") {
      delete data.password;
    }

    try {
      const result = await userService.update(id, data as any);
      return c.json(
        {
          code: 0,
          message: "用户修改成功",
          data: result,
        },
        200,
      );
    } catch (error: any) {
      throw new HTTPException(400, { message: error.message });
    }
  })
  .openapi(deleteRouteDoc, async (c) => {
    const id = Number(c.req.param("id"));
    try {
      await userService.delete(id);
      return c.json(
        {
          code: 0,
          message: "用户删除成功",
        },
        200,
      );
    } catch (error: any) {
      throw new HTTPException(400, { message: error.message });
    }
  })
  .openapi(batchDeleteRouteDoc, async (c) => {
    const { ids } = c.req.valid("json");
    try {
      await userService.deleteMany(ids);
      return c.json({ code: 0, message: "用户批量删除成功" }, 200);
    } catch (error: any) {
      throw new HTTPException(400, { message: error.message });
    }
  });

export default routes;
