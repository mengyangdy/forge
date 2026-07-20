/**
 * SystemLog 模块类型定义（从后端 Hono RPC 自动推导）
 */

import type { client, InferResponseType } from "@/service/client";

type AccessLogEnvelope = InferResponseType<
  (typeof client.api)["system-log"]["access"]["list"]["$get"]
>;
type OperationLogEnvelope = InferResponseType<
  (typeof client.api)["system-log"]["operation"]["list"]["$get"]
>;

export type AccessLogItem = AccessLogEnvelope extends { data: { list: (infer I)[] } } ? I : never;
export type OperationLogItem = OperationLogEnvelope extends { data: { list: (infer I)[] } }
  ? I
  : never;

export interface AccessLogSearchParams {
  current?: number;
  method?: string;
  size?: number;
  status?: number | string;
  username?: string;
}

export interface OperationLogSearchParams {
  action?: string;
  current?: number;
  module?: string;
  size?: number;
  status?: number | string;
  username?: string;
}
