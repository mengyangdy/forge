import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { requirePermission } from "../../guards/index.js";
import { departmentService } from "./department.service.js";

const app = new OpenAPIHono();

// 所有部门管理接口均需登录验证
app.use("*", authMiddleware);

const createSchema = z.object({
  name: z.string().trim().min(1, "部门名称不能为空"),
  parentId: z.number().nullable().optional(),
  leaderUserId: z.number().nullable().optional(),
  status: z.enum(["active", "disabled"]).optional().default("active"),
});

const updateSchema = z.object({
  name: z.string().trim().min(1, "部门名称不能为空"),
  parentId: z.number().nullable().optional(),
  leaderUserId: z.number().nullable().optional(),
  status: z.enum(["active", "disabled"]),
});

// 1. 获取部门列表
app.use("/list", requirePermission("sys:dept:list"));
const listRoute = createRoute({
  method: "get",
  path: "/list",
  summary: "获取部门扁平列表",
  tags: ["部门管理 Department"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.array(z.any()),
          }),
        },
      },
      description: "成功返回部门列表",
    },
  },
});

app.openapi(listRoute, async (c) => {
  const list = await departmentService.list();
  return c.json({ code: 0, data: list }, 200);
});

// 2. 获取部门树形数据
app.use("/tree", requirePermission("sys:dept:list"));
const treeRoute = createRoute({
  method: "get",
  path: "/tree",
  summary: "获取部门树形列表",
  tags: ["部门管理 Department"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.array(z.any()),
          }),
        },
      },
      description: "成功返回部门树",
    },
  },
});

app.openapi(treeRoute, async (c) => {
  const tree = await departmentService.tree();
  return c.json({ code: 0, data: tree }, 200);
});

// 3. 获取部门详情
app.use("/{id}", requirePermission("sys:dept:list"));
const detailRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "获取部门详情",
  tags: ["部门管理 Department"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "部门ID" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.any(),
          }),
        },
      },
      description: "成功返回部门详情",
    },
  },
});

app.openapi(detailRoute, async (c) => {
  const id = Number(c.req.param("id"));
  const detail = await departmentService.detail(id);
  return c.json({ code: 0, data: detail }, 200);
});

app.use("/create", requirePermission("sys:dept:create"));
// 4. 创建部门
const createRouteDoc = createRoute({
  method: "post",
  path: "/create",
  summary: "创建部门",
  tags: ["部门管理 Department"],
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

app.openapi(createRouteDoc, async (c) => {
  const data = c.req.valid("json");
  const result = await departmentService.create(data);
  return c.json({ code: 0, message: "部门创建成功", data: result }, 200);
});

// 5. 更新部门
const updateRouteDoc = createRoute({
  method: "put",
  path: "/{id}",
  summary: "更新部门",
  tags: ["部门管理 Department"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "部门ID" }),
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

app.openapi(updateRouteDoc, async (c) => {
  const id = Number(c.req.param("id"));
  const data = c.req.valid("json");
  const result = await departmentService.update(id, data);
  return c.json({ code: 0, message: "部门修改成功", data: result }, 200);
});

// 6. 删除部门
const deleteRouteDoc = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "删除部门",
  tags: ["部门管理 Department"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "部门ID" }),
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

app.openapi(deleteRouteDoc, async (c) => {
  const id = Number(c.req.param("id"));
  await departmentService.delete(id);
  return c.json({ code: 0, message: "部门删除成功" }, 200);
});

// 7. 批量删除部门
const batchDeleteRouteDoc = createRoute({
  method: "post",
  path: "/batch-delete",
  summary: "批量删除部门",
  tags: ["部门管理 Department"],
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

app.openapi(batchDeleteRouteDoc, async (c) => {
  const { ids } = c.req.valid("json");
  await departmentService.deleteMany(ids);
  return c.json({ code: 0, message: "部门批量删除成功" }, 200);
});

export default app;
