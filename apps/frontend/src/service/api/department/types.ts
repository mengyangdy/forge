/**
 * Department 模块类型定义（从后端 Hono RPC 自动推导）
 */

import type { client, InferResponseType } from "@/service/client";

type DeptListEnvelope = InferResponseType<typeof client.api.department.list.$get>;

/** 部门列表响应 */
export type DeptListResponse = DeptListEnvelope extends { data: infer D } ? D : never;
export type DeptListItem = DeptListResponse extends (infer I)[] ? I : never;
export type DeptStatus = DeptListItem["status"];

/** 部门树节点 */
export interface DeptTreeNode extends DeptListItem {
  children?: DeptTreeNode[];
}

/** 部门新增与修改参数 */
export type DeptCreateParams = Parameters<typeof client.api.department.create.$post>[0]["json"];
export type DeptUpdateParams = Parameters<(typeof client.api.department)[":id"]["$put"]>[0]["json"];

export interface DeptSearchParams {
  current: number;
  size: number;
  name?: string;
  leaderName?: string;
  status?: DeptStatus;
}
