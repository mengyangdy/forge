/**
 * Storage 模块类型定义（从后端 Hono RPC 自动推导）
 */

import type { client, InferResponseType } from "@/service/client";

type StorageCheckEnvelope = InferResponseType<typeof client.api.storage.check.$get>;
type StorageConfigEnvelope = InferResponseType<typeof client.api.storage.config.$get>;
type StorageListEnvelope = InferResponseType<typeof client.api.storage.list.$get>;

export type FileCheckResult = StorageCheckEnvelope extends { data: infer D } ? D : never;
export type StorageConfigPayload = StorageConfigEnvelope extends { data: infer D } ? D : never;
export type FileRecordItem = StorageListEnvelope extends { data: (infer I)[] } ? I : never;

export interface StorageSearchParams {
  filename?: string;
}
