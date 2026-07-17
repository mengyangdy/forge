import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { requirePermission } from "../../guards/index.js";
import { permissionService } from "./permission.service.js";

const app = new OpenAPIHono();

// 所有菜单权限管理接口均需要登录验证
app.use("*", authMiddleware);

const createSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "权限名称不能为空"),
  type: z.enum(["menu", "button", "catalogue"]),
  parentId: z.number().nullable().optional(),
  routeName: z.string().nullable().optional(),
  routePath: z.string().nullable().optional(),
  component: z.string().nullable().optional(),
  pathParam: z.string().nullable().optional(),
  i18nKey: z.string().nullable().optional(),
  order: z.number().optional(),
  iconType: z.string().optional(),
  icon: z.string().nullable().optional(),
  status: z.string().optional(),
  buttons: z
    .array(
      z.object({
        code: z.string().min(1, "按钮编码不能为空"),
        name: z.string().min(1, "按钮名称不能为空"),
      }),
    )
    .optional(),
});

const updateSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "权限名称不能为空"),
  type: z.enum(["menu", "button", "catalogue"]),
  parentId: z.number().nullable().optional(),
  routeName: z.string().nullable().optional(),
  routePath: z.string().nullable().optional(),
  component: z.string().nullable().optional(),
  pathParam: z.string().nullable().optional(),
  i18nKey: z.string().nullable().optional(),
  order: z.number().optional(),
  iconType: z.string().optional(),
  icon: z.string().nullable().optional(),
  status: z.string().optional(),
});

// 2. 查询权限树
app.use("/tree", requirePermission("sys:menu:list"));
const treeRoute = createRoute({
  method: "get",
  path: "/tree",
  summary: "查询权限/菜单层级树",
  tags: ["权限菜单管理 Permission"],
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
      description: "成功返回树形数据",
    },
  },
});

app.openapi(treeRoute, async (c) => {
  const tree = await permissionService.tree();
  return c.json(
    {
      code: 0,
      data: tree,
    },
    200,
  );
});

// 3. 创建权限
app.use("/create", requirePermission("sys:menu:create"));
const createRouteDoc = createRoute({
  method: "post",
  path: "/create",
  summary: "创建菜单/按钮权限",
  tags: ["权限菜单管理 Permission"],
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
  const result = await permissionService.create(data);
  return c.json(
    {
      code: 0,
      message: "添加权限成功",
      data: result,
    },
    200,
  );
});
app.on("PUT", ["/{id}"], requirePermission("sys:menu:update"));

// 4. 更新权限
const updateRouteDoc = createRoute({
  method: "put",
  path: "/{id}",
  summary: "修改菜单/按钮权限",
  tags: ["权限菜单管理 Permission"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "权限菜单ID" }),
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
  const result = await permissionService.update(id, data);
  return c.json(
    {
      code: 0,
      message: "修改权限成功",
      data: result,
    },
    200,
  );
});
app.on("DELETE", ["/{id}"], requirePermission("sys:menu:delete"));

// 5. 删除权限
const deleteRouteDoc = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "删除菜单/按钮权限",
  tags: ["权限菜单管理 Permission"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "权限菜单ID" }),
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
    400: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            message: z.string(),
          }),
        },
      },
      description: "删除失败",
    },
  },
});

app.openapi(deleteRouteDoc, async (c) => {
  const id = Number(c.req.param("id"));
  try {
    await permissionService.delete(id);
    return c.json(
      {
        code: 0,
        message: "删除权限成功",
      },
      200,
    );
  } catch (error: any) {
    return c.json(
      {
        code: 400,
        message: error.message,
      },
      400,
    );
  }
});

// 6. 批量删除菜单/按钮权限
const batchDeleteRouteDoc = createRoute({
  method: "post",
  path: "/batch-delete",
  summary: "批量删除菜单/按钮权限",
  tags: ["权限菜单管理 Permission"],
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
    400: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            message: z.string(),
          }),
        },
      },
      description: "批量删除失败",
    },
  },
});

app.use("/batch-delete", requirePermission("sys:menu:delete"));

app.openapi(batchDeleteRouteDoc, async (c) => {
  const { ids } = c.req.valid("json");
  try {
    await permissionService.deleteMany(ids);
    return c.json({ code: 0, message: "批量删除权限成功" }, 200);
  } catch (error: any) {
    return c.json(
      {
        code: 400,
        message: error.message,
      },
      400,
    );
  }
});

export default app;
