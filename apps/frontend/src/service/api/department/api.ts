import { request } from "@/service/request";

import type { DeptCreateParams, DeptListResponse, DeptTreeNode, DeptUpdateParams } from "./types";

const URLS = {
  LIST: "/api/department/list",
  TREE: "/api/department/tree",
  DETAIL: "/api/department",
  CREATE: "/api/department/create",
} as const;

export const deptApi = {
  /** 扁平列表（含 leaderName）。 */
  list: () => request<DeptListResponse>({ method: "get", url: URLS.LIST }).then((res) => res.data),

  /** 层级树。 */
  tree: () => request<DeptTreeNode[]>({ method: "get", url: URLS.TREE }).then((res) => res.data),

  /** 创建部门。 */
  create: (data: DeptCreateParams) =>
    request({ method: "post", url: URLS.CREATE, data }).then((res) => res.data),

  /** 更新部门。 */
  update: (id: number, data: DeptUpdateParams) =>
    request({ method: "put", url: `${URLS.DETAIL}/${id}`, data }).then((res) => res.data),

  /** 删除部门。 */
  remove: (id: number) =>
    request({ method: "delete", url: `${URLS.DETAIL}/${id}` }).then((res) => res.data),

  /** 批量删除部门。 */
  batchRemove: (ids: number[]) =>
    request({ method: "post", url: `${URLS.DETAIL}/batch-delete`, data: { ids } }).then(
      (res) => res.data,
    ),
};

export const deptKeys = {
  all: ["dept"] as const,
  list: () => [...deptKeys.all, "list"] as const,
  tree: () => [...deptKeys.all, "tree"] as const,
};
