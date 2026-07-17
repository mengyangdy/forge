import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { requirePermission } from "../../guards/index.js";
import { storageService } from "./storage.service.js";
import { HTTPException } from "hono/http-exception";

const app = new OpenAPIHono();

// 挂载全局登录鉴权中间件
app.use("*", authMiddleware);

// =================== OpenAPI 路由描述定义 ===================

// 1. 大文件上传预检接口
app.use("/check", requirePermission("sys:file:upload"));
const checkRoute = createRoute({
  method: "get",
  path: "/check",
  summary: "大文件上传预检 (秒传及断点续传校验)",
  tags: ["存储引擎 Storage"],
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      hash: z.string().openapi({ description: "文件的 MD5 哈希值" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.object({
              exists: z.boolean().openapi({ description: "文件是否已秒传成功" }),
              url: z.string().openapi({ description: "秒传成功时的访问 URL" }).optional(),
              uploadedChunks: z
                .array(z.number())
                .optional()
                .openapi({ description: "已成功上传的分片索引列表" }),
            }),
          }),
        },
      },
      description: "成功返回校验结果",
    },
  },
});

// 2. 分片上传接口 (使用 Form 表单多部分数据)
app.use("/upload-chunk", requirePermission("sys:file:upload"));
const uploadChunkRoute = createRoute({
  method: "post",
  path: "/upload-chunk",
  summary: "上传文件分片",
  tags: ["存储引擎 Storage"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            hash: z.string().openapi({ description: "文件的 MD5 哈希值" }),
            index: z.string().openapi({ description: "当前分片的索引值（从 0 开始）" }),
            file: z
              .any()
              .openapi({ type: "string", format: "binary", description: "分片二进制文件" }),
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
      description: "分片上传成功",
    },
  },
});

// 3. 文件合并接口
app.use("/merge", requirePermission("sys:file:upload"));
const mergeRoute = createRoute({
  method: "post",
  path: "/merge",
  summary: "合并上传的分片文件",
  tags: ["存储引擎 Storage"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            hash: z.string().openapi({ description: "文件的 MD5 哈希值" }),
            filename: z.string().openapi({ description: "文件原始名称" }),
            totalChunks: z.number().openapi({ description: "分片总个数" }),
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
            data: z.object({
              id: z.number().openapi({ description: "文件 ID" }),
              hash: z.string().openapi({ description: "文件 MD5 哈希值" }),
              filename: z.string().openapi({ description: "文件名" }),
              url: z.string().openapi({ description: "文件最终存储/可下载地址" }),
              size: z.number().openapi({ description: "文件大小" }),
              mimeType: z.string().openapi({ description: "文件 MIME 类型" }).nullable(),
              provider: z.string().openapi({ description: "存储适配器类型" }),
              createdAt: z.any().openapi({ description: "创建时间" }),
            }),
          }),
        },
      },
      description: "合并文件成功",
    },
  },
});

// =================== 路由处理器绑定 ===================

app.openapi(checkRoute, async (c) => {
  const hash = c.req.query("hash");
  if (!hash) {
    throw new HTTPException(400, { message: "缺少 query.hash 参数" });
  }

  const result = await storageService.checkFile(hash);
  return c.json({ code: 0, data: result }, 200);
});

app.openapi(uploadChunkRoute, async (c) => {
  const body = await c.req.parseBody();
  const hash = body.hash as string;
  const indexStr = body.index as string;
  const file = body.file;

  if (!hash || !indexStr || !file) {
    throw new HTTPException(400, { message: "缺少必要参数: hash, index 或 file" });
  }

  const index = Number(indexStr);
  if (isNaN(index)) {
    throw new HTTPException(400, { message: "参数 index 必须是有效数字" });
  }

  // 处理文件，转换为 Buffer
  let buffer: Buffer;
  try {
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (typeof file === "string") {
      buffer = Buffer.from(file);
    } else {
      const anyFile = file as any;
      if (anyFile.arrayBuffer) {
        buffer = Buffer.from(await anyFile.arrayBuffer());
      } else {
        throw new Error("Invalid file content type");
      }
    }
  } catch {
    throw new HTTPException(400, { message: "解析文件二进制失败" });
  }

  await storageService.saveChunk(hash, index, buffer);
  return c.json({ code: 0, message: `分片 ${index} 写入暂存区成功` }, 200);
});

app.openapi(mergeRoute, async (c) => {
  const { hash, filename, totalChunks } = c.req.valid("json");

  try {
    const fileRecord = await storageService.mergeChunks(hash, filename, totalChunks);
    return c.json(
      {
        code: 0,
        message: "大文件合并与传输上传成功",
        data: fileRecord as any,
      },
      200,
    );
  } catch (error: any) {
    throw new HTTPException(400, { message: error.message || "分片合并失败，请核实分片完整性" });
  }
});

export default app;
