/**
 * User API 模块
 *
 * 包含：
 * - URL 常量
 * - API 函数
 * - Query Keys（层级结构）
 */

import { request } from "@/service/request";

import type {
  UserCreateParams,
  UserListResponse,
  UserSearchParams,
  UserUpdateParams,
} from "./types";

// ============================================================================
// URL 常量
// ============================================================================

const URLS = {
  LIST: "/api/user/list",
  DETAIL: "/api/user",
  CREATE: "/api/user/create",
} as const;

// ============================================================================
// API 函数（纯函数，无状态）
// ============================================================================

export const userApi = {
  /**
   * 查询用户列表（分页）
   *
   * 注意：useTable 内部使用 `current/size` 作为分页字段，
   * 而后端接口期望 `page/pageSize`，这里做转换。
   */
  list: (params: UserSearchParams) => {
    const { current: page, size: pageSize, ...rest } = params;

    return request<UserListResponse>({
      method: "get",
      url: URLS.LIST,
      params: {
        page,
        pageSize,
        ...rest,
      },
    }).then((res) => res.data);
  },

  /** 创建用户。 */
  create: (data: UserCreateParams) =>
    request({ method: "post", url: URLS.CREATE, data }).then((res) => res.data),

  /** 更新用户。 */
  update: (id: number, data: UserUpdateParams) =>
    request({ method: "put", url: `${URLS.DETAIL}/${id}`, data }).then((res) => res.data),

  /** 删除用户。 */
  remove: (id: number) =>
    request({ method: "delete", url: `${URLS.DETAIL}/${id}` }).then((res) => res.data),

  /** 批量删除用户。 */
  batchRemove: (ids: number[]) =>
    request({ method: "post", url: `${URLS.DETAIL}/batch-delete`, data: { ids } }).then(
      (res) => res.data,
    ),
};

// ============================================================================
// Query Keys
// ============================================================================

export const userKeys = {
  all: ["user"] as const,
  list: () => [...userKeys.all, "list"] as const,
};
