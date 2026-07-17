import { request } from "@/service/request";

import type {
  RoleCreateParams,
  RoleDetailResponse,
  RoleListResponse,
  RoleSearchParams,
  RoleUpdateParams,
} from "./types";

const URLS = {
  LIST: "/api/role/list",
  DETAIL: "/api/role",
  CREATE: "/api/role/create",
} as const;

export const roleApi = {
  list: (params: RoleSearchParams) => {
    const { current: page, size: pageSize, ...rest } = params;
    return request<RoleListResponse>({
      method: "get",
      url: URLS.LIST,
      params: { page, pageSize, ...rest },
    }).then((res) => res.data);
  },
  detail: (id: number) => {
    return request<RoleDetailResponse>({
      method: "get",
      url: `${URLS.DETAIL}/${id}`,
    }).then((res) => res.data);
  },
  create: (data: RoleCreateParams) => {
    return request({ method: "post", url: URLS.CREATE, data }).then((res) => res.data);
  },
  update: (id: number, data: RoleUpdateParams) => {
    return request({ method: "put", url: `${URLS.DETAIL}/${id}`, data }).then((res) => res.data);
  },
  remove: (id: number) => {
    return request({ method: "delete", url: `${URLS.DETAIL}/${id}` }).then((res) => res.data);
  },
  batchRemove: (ids: number[]) => {
    return request({ method: "post", url: `${URLS.DETAIL}/batch-delete`, data: { ids } }).then(
      (res) => res.data,
    );
  },
};

export const roleKeys = {
  all: ["role"] as const,
  list: () => [...roleKeys.all, "list"] as const,
  listAll: () => [...roleKeys.all, "list-all"] as const,
};
