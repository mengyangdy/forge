import { request } from "@/service/request";

import type { PermissionCreateParams, PermissionTreeNode, PermissionUpdateParams } from "./types";

const URLS = {
  TREE: "/api/permission/tree",
  CREATE: "/api/permission/create",
  DETAIL: "/api/permission",
} as const;

export const permissionApi = {
  /** 层级树。 */
  tree: () =>
    request<PermissionTreeNode[]>({ method: "get", url: URLS.TREE }).then((res) => res.data),

  /** 创建菜单/权限。 */
  create: (data: PermissionCreateParams) =>
    request({ method: "post", url: URLS.CREATE, data }).then((res) => res.data),

  /** 更新菜单/权限。 */
  update: (id: number, data: PermissionUpdateParams) =>
    request({ method: "put", url: `${URLS.DETAIL}/${id}`, data }).then((res) => res.data),

  /** 删除菜单/权限。 */
  remove: (id: number) =>
    request({ method: "delete", url: `${URLS.DETAIL}/${id}` }).then((res) => res.data),

  /** 批量删除菜单/权限。 */
  batchRemove: (ids: number[]) =>
    request({ method: "post", url: `${URLS.DETAIL}/batch-delete`, data: { ids } }).then(
      (res) => res.data,
    ),
};

export const permissionKeys = {
  all: ["permission"] as const,
  tree: () => [...permissionKeys.all, "tree"] as const,
};
