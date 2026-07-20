/**
 * SystemOnline 模块类型定义（从后端 Hono RPC 自动推导）
 */

import type { client, InferResponseType } from "@/service/client";

type OnlineListEnvelope = InferResponseType<(typeof client.api)["system-online"]["list"]["$get"]>;

export type OnlineUserItem = OnlineListEnvelope extends { data: (infer I)[] } ? I : never;

export interface OnlineUserSearchParams {
  username?: string;
}
