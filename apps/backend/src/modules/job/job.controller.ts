import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { requirePermission } from "../../guards/index.js";
import { jobService } from "./job.service.js";
import { HTTPException } from "hono/http-exception";

const app = new OpenAPIHono();

// 全局引入 Bearer JWT 认证
app.use("*", authMiddleware);

// =================== OpenAPI 接口定义 ===================

// 1. 获取所有队列概览列表
app.use("/queues", requirePermission("sys:job:list"));
const queuesRoute = createRoute({
  method: "get",
  path: "/queues",
  summary: "获取定时任务队列列表与概览统计",
  tags: ["任务调度 Job"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.array(
              z.object({
                name: z.string().openapi({ description: "队列名称" }),
                counts: z.object({
                  waiting: z.number().openapi({ description: "等待执行数" }),
                  active: z.number().openapi({ description: "正在执行数" }),
                  completed: z.number().openapi({ description: "执行成功数" }),
                  failed: z.number().openapi({ description: "执行失败数" }),
                  delayed: z.number().openapi({ description: "延时队列数" }),
                  paused: z.number().openapi({ description: "挂起暂停数" }),
                }),
                isPaused: z.boolean().openapi({ description: "队列当前是否暂停" }),
                repeatableJobs: z.array(
                  z.object({
                    key: z.string().openapi({ description: "定时任务唯一标识" }),
                    name: z.string().openapi({ description: "任务类型" }),
                    cron: z.string().openapi({ description: "Cron 规则表达式" }),
                    next: z.string().openapi({ description: "下一次执行时间" }).nullable(),
                  }),
                ),
              }),
            ),
          }),
        },
      },
      description: "成功返回队列列表与任务数量统计",
    },
  },
});

// 2. 查询指定队列、指定状态的任务列表（分页）
app.use("/list", requirePermission("sys:job:list"));
const listRoute = createRoute({
  method: "get",
  path: "/list",
  summary: "分页获取队列中指定状态的任务列表",
  tags: ["任务调度 Job"],
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      queue: z.string().openapi({ description: "队列名称" }),
      status: z
        .enum(["waiting", "active", "completed", "failed", "delayed", "paused"])
        .openapi({ description: "任务状态" }),
      page: z.string().optional().default("1"),
      pageSize: z.string().optional().default("10"),
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
                  id: z.string().openapi({ description: "任务 ID" }).optional(),
                  name: z.string().openapi({ description: "任务名称" }),
                  data: z.any().openapi({ description: "任务入参数据" }),
                  progress: z.any().openapi({ description: "任务完成进度" }),
                  failedReason: z.string().openapi({ description: "失败原因描述" }).optional(),
                  timestamp: z.number().openapi({ description: "任务创建时间戳" }),
                  processedOn: z
                    .number()
                    .optional()
                    .nullable()
                    .openapi({ description: "任务开始执行时间戳" }),
                  finishedOn: z
                    .number()
                    .optional()
                    .nullable()
                    .openapi({ description: "任务结束时间戳" }),
                  returnValue: z.any().openapi({ description: "任务执行返回值" }).optional(),
                }),
              ),
              total: z.number().openapi({ description: "当前状态下任务总数量" }),
            }),
          }),
        },
      },
      description: "成功返回指定状态下的分页任务列表",
    },
  },
});

// 3. 获取单个任务的详细信息
app.use("/detail", requirePermission("sys:job:list"));
const detailRoute = createRoute({
  method: "get",
  path: "/detail",
  summary: "获取指定任务的明细 (包含报错堆栈)",
  tags: ["任务调度 Job"],
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      queue: z.string().openapi({ description: "队列名称" }),
      jobId: z.string().openapi({ description: "任务唯一 ID" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.object({
              id: z.string().openapi({ description: "任务 ID" }).optional(),
              name: z.string().openapi({ description: "任务名称" }),
              data: z.any().openapi({ description: "任务入参数据" }),
              progress: z.any().openapi({ description: "任务进度" }),
              failedReason: z.string().openapi({ description: "失败原因" }).optional(),
              stacktrace: z.array(z.string()).openapi({ description: "报错堆栈跟踪" }),
              timestamp: z.number().openapi({ description: "任务创建时间戳" }),
              processedOn: z
                .number()
                .optional()
                .nullable()
                .openapi({ description: "开始执行时间戳" }),
              finishedOn: z
                .number()
                .optional()
                .nullable()
                .openapi({ description: "完成执行时间戳" }),
              returnValue: z.any().openapi({ description: "返回值" }).optional(),
            }),
          }),
        },
      },
      description: "成功返回任务详细信息",
    },
  },
});

app.use("/action", requirePermission("sys:job:action"));
// 4. 执行调度控制操作
const actionRoute = createRoute({
  method: "post",
  path: "/action",
  summary: "任务与队列控制调度操作",
  tags: ["任务调度 Job"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            queue: z.string().openapi({ description: "队列名称" }),
            jobId: z
              .string()
              .nullable()
              .optional()
              .openapi({ description: "任务 ID（不传则针对整条队列操作）" }),
            action: z.enum(["retry", "remove", "pause", "resume"]).openapi({
              description: "控制行为: retry 重试, remove 移除, pause 暂停队列, resume 恢复队列",
            }),
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
      description: "操作执行成功",
    },
  },
});

app.use("/trigger", requirePermission("sys:job:action"));
// 5. 手动创建测试任务 (演示用)
const triggerRoute = createRoute({
  method: "post",
  path: "/trigger",
  summary: "手动向队列派发测试任务 (演示调试用)",
  tags: ["任务调度 Job"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            queue: z.enum(["emailQueue", "systemQueue"]).openapi({ description: "队列名称" }),
            jobName: z.string().openapi({ description: "任务类型名称" }),
            data: z.record(z.string(), z.any()).openapi({ description: "任务数据荷载 Payload" }),
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
              id: z.string().openapi({ description: "派发后的任务 ID" }).optional(),
              name: z.string().openapi({ description: "任务名称" }),
              timestamp: z.number().openapi({ description: "生成时间戳" }),
            }),
          }),
        },
      },
      description: "成功压入测试任务",
    },
  },
});

// =================== 接口逻辑方法绑定 ===================

app.openapi(queuesRoute, async (c) => {
  const result = await jobService.getQueues();
  return c.json({ code: 0, data: result as any }, 200);
});

app.openapi(listRoute, async (c) => {
  const queue = c.req.query("queue");
  const status = c.req.query("status");
  const page = Number(c.req.query("page") || 1);
  const pageSize = Number(c.req.query("pageSize") || 10);

  if (!queue || !status) {
    throw new HTTPException(400, { message: "缺少必要查询参数: queue 或 status" });
  }

  const result = await jobService.getJobs(queue, status, page, pageSize);
  return c.json({ code: 0, data: result as any }, 200);
});

app.openapi(detailRoute, async (c) => {
  const queue = c.req.query("queue");
  const jobId = c.req.query("jobId");

  if (!queue || !jobId) {
    throw new HTTPException(400, { message: "缺少必要查询参数: queue 或 jobId" });
  }

  try {
    const result = await jobService.getJobDetail(queue, jobId);
    return c.json({ code: 0, data: result as any }, 200);
  } catch (error: any) {
    throw new HTTPException(400, { message: error.message || "获取任务明细失败" });
  }
});

app.openapi(actionRoute, async (c) => {
  const { queue, jobId, action } = c.req.valid("json");

  try {
    const result = await jobService.executeAction(queue, jobId || null, action);
    return c.json({ code: 0, message: result.message }, 200);
  } catch (error: any) {
    throw new HTTPException(400, { message: error.message || "调度动作执行失败" });
  }
});

app.openapi(triggerRoute, async (c) => {
  const { queue, jobName, data } = c.req.valid("json");

  try {
    const result = await jobService.addTestJob(queue, jobName, data);
    return c.json({ code: 0, message: "测试任务成功压入调度队列", data: result as any }, 200);
  } catch (error: any) {
    throw new HTTPException(400, { message: error.message || "测试任务派发失败" });
  }
});

export default app;
