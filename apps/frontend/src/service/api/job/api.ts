/**
 * Job API 模块
 *
 * 基于 Hono RPC 客户端推导
 */

import { client, unwrap } from "@/service/client";

import type { JobActionPayload, JobListSearchParams, JobTriggerPayload } from "./types";

export const jobApi = {
  /** 控制命令 (重试, 移除, 暂停, 恢复) */
  action: (data: JobActionPayload) => unwrap(client.api.jobs.action.$post({ json: data })),

  /** 单个任务明细 (含报错堆栈) */
  detail: (queue: string, jobId: string) =>
    unwrap(client.api.jobs.detail.$get({ query: { queue, jobId } })),

  /** 分页任务列表 */
  list: (params: JobListSearchParams) => {
    return unwrap(
      client.api.jobs.list.$get({
        query: {
          queue: params.queue,
          status: params.status,
          ...(params.page !== undefined ? { page: String(params.page) } : {}),
          ...(params.pageSize !== undefined ? { pageSize: String(params.pageSize) } : {}),
        },
      }),
    );
  },

  /** 队列概览与统计 */
  queues: () => unwrap(client.api.jobs.queues.$get()),

  /** 派发测试任务 */
  trigger: (data: JobTriggerPayload) => unwrap(client.api.jobs.trigger.$post({ json: data })),
};

export const jobKeys = {
  all: ["jobs"] as const,
  detail: (queue: string, jobId: string) => [...jobKeys.all, "detail", queue, jobId] as const,
  list: (params: JobListSearchParams) => [...jobKeys.all, "list", params] as const,
  queues: () => [...jobKeys.all, "queues"] as const,
};
