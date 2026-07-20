/**
 * Role 模块类型定义（从后端 Hono RPC 自动推导）
 */

import type { client, InferResponseType } from "@/service/client";

type RoleListEnvelope = InferResponseType<typeof client.api.role.list.$get>;

/** 角色列表响应 */
export type RoleListResponse = RoleListEnvelope extends { data: infer D } ? D : never;

/** 角色列表项 */
export type RoleListItem = RoleListResponse extends { list: (infer Item)[] } ? Item : never;

/** 角色数据范围 */
export type RoleDataScope = RoleListItem["dataScope"];

/** 角色新增参数 */
export type RoleCreateParams = Parameters<typeof client.api.role.create.$post>[0]["json"];

/** 角色更新参数 */
export type RoleUpdateParams = Parameters<(typeof client.api.role)[":id"]["$put"]>[0]["json"];

/** 角色详情 */
export type RoleDetailResponse =
  InferResponseType<(typeof client.api.role)[":id"]["$get"]> extends { data: infer D } ? D : never;

/** 角色搜索参数 */
export interface RoleSearchParams {
  current: number;
  size: number;
  name?: string;
  code?: string;
  dataScope?: string;
}
