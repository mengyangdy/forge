/**
 * Department API 模块
 *
 * 基于 Hono RPC 客户端推导
 */

import { client, unwrap } from "@/service/client";

import type { DeptCreateParams, DeptListItem, DeptTreeNode, DeptUpdateParams } from "./types";

export const deptApi = {
  /** 扁平列表 */
  list: () => unwrap(client.api.department.list.$get()) as Promise<DeptListItem[]>,

  /** 层级树 */
  tree: () => unwrap(client.api.department.tree.$get()) as Promise<DeptTreeNode[]>,

  /** 创建部门 */
  create: (data: DeptCreateParams) => unwrap(client.api.department.create.$post({ json: data })),

  /** 更新部门 */
  update: (id: number, data: DeptUpdateParams) =>
    unwrap(client.api.department[":id"].$put({ param: { id: String(id) }, json: data })),

  /** 删除部门 */
  remove: (id: number) =>
    unwrap(client.api.department[":id"].$delete({ param: { id: String(id) } })),

  /** 批量删除部门 */
  batchRemove: (ids: number[]) =>
    unwrap(client.api.department["batch-delete"].$post({ json: { ids } })),
};

export const deptKeys = {
  all: ["dept"] as const,
  list: () => [...deptKeys.all, "list"] as const,
  tree: () => [...deptKeys.all, "tree"] as const,
};
