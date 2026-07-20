/**
 * Permission 模块类型定义（从后端 Hono RPC 自动推导）
 */

import type { client, InferResponseType } from "@/service/client";

type PermissionTreeEnvelope = InferResponseType<typeof client.api.permission.tree.$get>;

/** 权限/菜单列表响应 */
export type PermissionTreeResponse = PermissionTreeEnvelope extends { data: infer D } ? D : never;
export type PermissionListItem = PermissionTreeResponse extends (infer I)[] ? I : never;
export type PermissionType = PermissionListItem["type"];

/** 树形节点（含 children） */
export interface PermissionTreeNode extends PermissionListItem {
  children?: PermissionTreeNode[];
}

/** 新增与修改参数 */
export type PermissionCreateParams = Parameters<
  typeof client.api.permission.create.$post
>[0]["json"];
export type PermissionUpdateParams = Parameters<
  (typeof client.api.permission)[":id"]["$put"]
>[0]["json"];

export interface PermissionSearchParams {
  current: number;
  size: number;
  name?: string;
  code?: string;
  type?: PermissionType;
}
