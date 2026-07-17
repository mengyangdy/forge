import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { requirePermission } from "../../guards/index.js";
import { dictService } from "./dict.service.js";
import { insertDictTypeSchema, insertDictDataSchema } from "@forge/shared";
import { HTTPException } from "hono/http-exception";

const app = new OpenAPIHono();

// 挂载全局登录鉴权中间件
app.use("*", authMiddleware);

// =================== OpenAPI 路由描述定义 ===================

// 1. 获取全量字典包接口 (面向所有登录用户)
const allRoute = createRoute({
  method: "get",
  path: "/all",
  summary: "获取全量激活字典包 (前端全局缓存用)",
  tags: ["字典管理 Dict"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.record(
              z.string(),
              z.array(
                z.object({
                  label: z.string(),
                  value: z.string(),
                  listClass: z.string().nullable(),
                }),
              ),
            ),
          }),
        },
      },
      description: "成功返回全量字典数据包",
    },
  },
});

// 2. 查询字典类型列表
app.use("/type/list", requirePermission("sys:dict:list"));
const listTypesRoute = createRoute({
  method: "get",
  path: "/type/list",
  summary: "查询字典类型列表",
  tags: ["字典管理 Dict"],
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      page: z.string().optional().default("1"),
      pageSize: z.string().optional().default("10"),
      name: z.string().openapi({ description: "字典名称模糊匹配" }).optional(),
      type: z.string().openapi({ description: "类型唯一编码模糊匹配" }).optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.object({
              list: z.array(z.any()),
              total: z.number(),
            }),
          }),
        },
      },
      description: "成功返回字典类型列表",
    },
  },
});

// 3. 创建字典类型
app.use("/type/create", requirePermission("sys:dict:create"));
const createTypeRoute = createRoute({
  method: "post",
  path: "/type/create",
  summary: "创建字典类型",
  tags: ["字典管理 Dict"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertDictTypeSchema,
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

// 4. 更新字典类型
app.on("PUT", ["/type/{id}"], requirePermission("sys:dict:update"));
const updateTypeRoute = createRoute({
  method: "put",
  path: "/type/{id}",
  summary: "修改字典类型",
  tags: ["字典管理 Dict"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: insertDictTypeSchema,
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

app.on("DELETE", ["/type/{id}"], requirePermission("sys:dict:delete"));
// 5. 删除字典类型
const deleteTypeRoute = createRoute({
  method: "delete",
  path: "/type/{id}",
  summary: "删除字典类型 (物理级联删除明细项)",
  tags: ["字典管理 Dict"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
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
app.use("/data/list", requirePermission("sys:dict:list"));

// 6. 查询字典数据项明细列表
const listDataRoute = createRoute({
  method: "get",
  path: "/data/list",
  summary: "查询字典数据项列表",
  tags: ["字典管理 Dict"],
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      page: z.string().optional().default("1"),
      pageSize: z.string().optional().default("10"),
      dictType: z.string().openapi({ description: "字典类型标识 (唯一属性必传)" }),
      label: z.string().openapi({ description: "字典数据标签模糊搜索" }).optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.object({
              list: z.array(z.any()),
              total: z.number(),
            }),
          }),
        },
      },
      description: "成功返回明细列表",
    },
  },
});
app.use("/data/create", requirePermission("sys:dict:create"));

// 7. 创建字典数据项
const createDataRoute = createRoute({
  method: "post",
  path: "/data/create",
  summary: "创建字典数据项",
  tags: ["字典管理 Dict"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertDictDataSchema,
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
      description: "创建明细项成功",
    },
  },
});
app.on("PUT", ["/data/{id}"], requirePermission("sys:dict:update"));

// 8. 修改字典数据项
const updateDataRoute = createRoute({
  method: "put",
  path: "/data/{id}",
  summary: "修改字典数据项",
  tags: ["字典管理 Dict"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: insertDictDataSchema,
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
      description: "修改明细项成功",
    },
  },
});
app.on("DELETE", ["/data/{id}"], requirePermission("sys:dict:delete"));

// 9. 删除字典数据项
const deleteDataRoute = createRoute({
  method: "delete",
  path: "/data/{id}",
  summary: "删除字典数据项",
  tags: ["字典管理 Dict"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
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
      description: "删除明细项成功",
    },
  },
});

// =================== 逻辑方法绑定 ===================

app.openapi(allRoute, async (c) => {
  const result = await dictService.getAllDicts();
  return c.json({ code: 0, data: result }, 200);
});

app.openapi(listTypesRoute, async (c) => {
  const page = Number(c.req.query("page") || 1);
  const pageSize = Number(c.req.query("pageSize") || 10);
  const name = c.req.query("name");
  const type = c.req.query("type");

  const result = await dictService.listTypes(page, pageSize, { name, type });
  return c.json({ code: 0, data: result }, 200);
});

app.openapi(createTypeRoute, async (c) => {
  const data = c.req.valid("json");
  try {
    const result = await dictService.createType(data as any);
    return c.json({ code: 0, message: "创建字典类型成功", data: result }, 200);
  } catch (error: any) {
    throw new HTTPException(400, { message: error.message });
  }
});

app.openapi(updateTypeRoute, async (c) => {
  const id = Number(c.req.param("id"));
  const data = c.req.valid("json");
  try {
    const result = await dictService.updateType(id, data as any);
    return c.json({ code: 0, message: "修改字典类型成功", data: result }, 200);
  } catch (error: any) {
    throw new HTTPException(400, { message: error.message });
  }
});

app.openapi(deleteTypeRoute, async (c) => {
  const id = Number(c.req.param("id"));
  try {
    await dictService.deleteType(id);
    return c.json({ code: 0, message: "删除字典类型成功" }, 200);
  } catch (error: any) {
    throw new HTTPException(400, { message: error.message });
  }
});

app.openapi(listDataRoute, async (c) => {
  const page = Number(c.req.query("page") || 1);
  const pageSize = Number(c.req.query("pageSize") || 10);
  const dictType = c.req.query("dictType");
  const label = c.req.query("label");

  if (!dictType) {
    throw new HTTPException(400, { message: "缺少 dictType 字典类型参数" });
  }

  const result = await dictService.listData(page, pageSize, dictType, label);
  return c.json({ code: 0, data: result }, 200);
});

app.openapi(createDataRoute, async (c) => {
  const data = c.req.valid("json");
  try {
    const result = await dictService.createData(data as any);
    return c.json({ code: 0, message: "创建字典数据成功", data: result }, 200);
  } catch (error: any) {
    throw new HTTPException(400, { message: error.message });
  }
});

app.openapi(updateDataRoute, async (c) => {
  const id = Number(c.req.param("id"));
  const data = c.req.valid("json");
  try {
    const result = await dictService.updateData(id, data as any);
    return c.json({ code: 0, message: "修改字典数据成功", data: result }, 200);
  } catch (error: any) {
    throw new HTTPException(400, { message: error.message });
  }
});

app.openapi(deleteDataRoute, async (c) => {
  const id = Number(c.req.param("id"));
  try {
    await dictService.deleteData(id);
    return c.json({ code: 0, message: "删除字典数据成功" }, 200);
  } catch (error: any) {
    throw new HTTPException(400, { message: error.message });
  }
});

export default app;
