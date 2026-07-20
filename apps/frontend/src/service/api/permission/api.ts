/**
 * Permission API 模块
 *
 * 基于 Hono RPC 客户端推导
 */

import { client, unwrap } from "@/service/client";

import type { PermissionCreateParams, PermissionTreeNode, PermissionUpdateParams } from "./types";

export const permissionApi = {
  /** 层级树 */
  tree: () => unwrap(client.api.permission.tree.$get()) as Promise<PermissionTreeNode[]>,

  /** 创建菜单/权限 */
  create: (data: PermissionCreateParams) =>
    unwrap(client.api.permission.create.$post({ json: data })),

  /** 更新菜单/权限 */
  update: (id: number, data: PermissionUpdateParams) =>
    unwrap(client.api.permission[":id"].$put({ param: { id: String(id) }, json: data })),

  /** 删除菜单/权限 */
  remove: (id: number) =>
    unwrap(client.api.permission[":id"].$delete({ param: { id: String(id) } })),

  /** 批量删除菜单/权限 */
  batchRemove: (ids: number[]) =>
    unwrap(client.api.permission["batch-delete"].$post({ json: { ids } })),
};

export const permissionKeys = {
  all: ["permission"] as const,
  tree: () => [...permissionKeys.all, "tree"] as const,
};
