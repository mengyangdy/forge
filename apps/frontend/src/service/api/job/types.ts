/**
 * Job 模块类型定义（从后端 Hono RPC 自动推导）
 */

import type { client, InferResponseType } from "@/service/client";

type QueuesEnvelope = InferResponseType<typeof client.api.jobs.queues.$get>;
type JobListEnvelope = InferResponseType<typeof client.api.jobs.list.$get>;
type JobDetailEnvelope = InferResponseType<typeof client.api.jobs.detail.$get>;

export type QueueOverview = QueuesEnvelope extends { data: (infer D)[] } ? D : never;
export type QueueCounts = QueueOverview["counts"];
export type RepeatableJob = QueueOverview["repeatableJobs"][number];

export type JobItem = JobDetailEnvelope extends { data: infer D }
  ? D
  : JobListEnvelope extends { data: { list: (infer I)[] } }
    ? I
    : never;

export interface JobListSearchParams {
  page?: number;
  pageSize?: number;
  queue: string;
  status: "waiting" | "active" | "completed" | "failed" | "delayed" | "paused";
}

export type JobActionPayload = Parameters<typeof client.api.jobs.action.$post>[0]["json"];
export type JobTriggerPayload = Parameters<typeof client.api.jobs.trigger.$post>[0]["json"];
