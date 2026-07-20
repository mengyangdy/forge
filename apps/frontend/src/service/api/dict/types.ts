/**
 * Dict 模块类型定义（从后端 Hono RPC 自动推导）
 */

import type { client, InferResponseType } from "@/service/client";

type DictTypeListEnvelope = InferResponseType<typeof client.api.dict.type.list.$get>;
type DictDataListEnvelope = InferResponseType<typeof client.api.dict.data.list.$get>;
type AllDictsEnvelope = InferResponseType<typeof client.api.dict.all.$get>;

/** 全量字典响应包 */
export type AllDictsResponse = AllDictsEnvelope extends { data: infer D } ? D : Record<string, any>;
export type AllDictsItem = AllDictsResponse[string] extends (infer I)[] ? I : never;

/** 字典类型查询响应 */
export type DictTypeListResponse = DictTypeListEnvelope extends { data: infer D } ? D : never;
export type DictTypeListItem = DictTypeListResponse extends { list: (infer I)[] } ? I : never;

/** 字典类型搜索参数 */
export interface DictTypeSearchParams {
  current: number;
  size: number;
  name?: string;
  type?: string;
}

/** 字典类型新增与修改参数 */
export type DictTypeCreateParams = Parameters<typeof client.api.dict.type.create.$post>[0]["json"];
export type DictTypeUpdateParams = Parameters<
  (typeof client.api.dict.type)[":id"]["$put"]
>[0]["json"];

/** 字典明细项查询响应 */
export type DictDataListResponse = DictDataListEnvelope extends { data: infer D } ? D : never;
export type DictDataListItem = DictDataListResponse extends { list: (infer I)[] } ? I : never;

/** 字典明细搜索参数 */
export interface DictDataSearchParams {
  current: number;
  size: number;
  dictType: string;
  label?: string;
}

/** 字典明细新增与修改参数 */
export type DictDataCreateParams = Parameters<typeof client.api.dict.data.create.$post>[0]["json"];
export type DictDataUpdateParams = Parameters<
  (typeof client.api.dict.data)[":id"]["$put"]
>[0]["json"];
