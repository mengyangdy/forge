import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { requirePermission } from "../../guards/index.js";
import { roleService } from "./role.service.js";
import { HTTPException } from "hono/http-exception";

const app = new OpenAPIHono();

// 所有角色接口均需登录验证
app.use("*", authMiddleware);

const dataScopeSchema = z.enum(["all", "dept_child", "dept", "self", "custom"]);

const roleBaseSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  dataScope: dataScopeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

const roleDetailSchema = roleBaseSchema.extend({
  permissionIds: z.array(z.number()),
});

const createSchema = z.object({
  code: z.string().min(1, "角色编码不能为空"),
  name: z.string().min(1, "角色名称不能为空"),
  description: z.string().nullable().optional(),
  dataScope: dataScopeSchema.optional().default("self"),
  permissionIds: z.array(z.number()).optional(),
});

const updateSchema = z.object({
  code: z.string().min(1, "角色编码不能为空"),
  name: z.string().min(1, "角色名称不能为空"),
  description: z.string().nullable().optional(),
  dataScope: dataScopeSchema.optional(),
  permissionIds: z.array(z.number()).optional(),
});

// 1. 获取角色列表
const listRoute = createRoute({
  method: "get",
  path: "/list",
  summary: "获取角色列表",
  tags: ["角色管理 Role"],
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      page: z.string().openapi({ description: "页码（可选）" }).optional(),
      pageSize: z.string().openapi({ description: "每页条数（可选）" }).optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.object({
              list: z.array(roleBaseSchema),
              total: z.number(),
            }),
          }),
        },
      },
      description: "成功返回角色列表",
    },
  },
});

// 2. 获取角色详情
const detailRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "获取角色详情",
  tags: ["角色管理 Role"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "角色ID" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: roleDetailSchema,
          }),
        },
      },
      description: "成功返回角色详情",
    },
  },
});

// 3. 创建角色
const createRouteDoc = createRoute({
  method: "post",
  path: "/create",
  summary: "创建角色",
  tags: ["角色管理 Role"],
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
            data: roleBaseSchema,
          }),
        },
      },
      description: "创建成功",
    },
  },
});

// 4. 更新角色
const updateRouteDoc = createRoute({
  method: "put",
  path: "/{id}",
  summary: "修改角色",
  tags: ["角色管理 Role"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "角色ID" }),
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
            data: roleBaseSchema,
          }),
        },
      },
      description: "修改成功",
    },
  },
});

// 5. 删除角色
const deleteRouteDoc = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "删除角色",
  tags: ["角色管理 Role"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "角色ID" }),
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

// 6. 批量删除角色
const batchDeleteRouteDoc = createRoute({
  method: "post",
  path: "/batch-delete",
  summary: "批量删除角色",
  tags: ["角色管理 Role"],
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

app.use("/list", requirePermission("sys:role:list"));
app.use("/{id}", requirePermission("sys:role:list"));
app.use("/create", requirePermission("sys:role:create"));
app.on("PUT", ["/{id}"], requirePermission("sys:role:update"));
app.on("DELETE", ["/{id}"], requirePermission("sys:role:delete"));
app.use("/batch-delete", requirePermission("sys:role:delete"));

const routes = app
  .openapi(listRoute, async (c) => {
    const pageQuery = c.req.query("page");
    const pageSizeQuery = c.req.query("pageSize");
    const page = pageQuery ? Number(pageQuery) : undefined;
    const pageSize = pageSizeQuery ? Number(pageSizeQuery) : undefined;

    const result = await roleService.list(page, pageSize);
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
      const detail = await roleService.detail(id);
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
      const result = await roleService.create(data);
      return c.json(
        {
          code: 0,
          message: "角色创建成功",
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
    try {
      const result = await roleService.update(id, data);
      return c.json(
        {
          code: 0,
          message: "角色修改成功",
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
      await roleService.delete(id);
      return c.json(
        {
          code: 0,
          message: "角色删除成功",
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
      await roleService.deleteMany(ids);
      return c.json({ code: 0, message: "角色批量删除成功" }, 200);
    } catch (error: any) {
      throw new HTTPException(400, { message: error.message });
    }
  });

export default routes;
