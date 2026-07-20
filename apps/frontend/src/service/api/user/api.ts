/**
 * User API 模块
 *
 * 基于 Hono RPC 客户端推导
 */

import { client, unwrap } from "@/service/client";

import type { UserCreateParams, UserSearchParams, UserUpdateParams } from "./types";

export const userApi = {
  /**
   * 查询用户列表（分页）
   */
  list: (params: UserSearchParams) => {
    const { current: page, size: pageSize, username, nickname, status } = params;

    const queryParams: Record<string, string> = {
      page: String(page),
      pageSize: String(pageSize),
    };
    if (username) queryParams.username = username;
    if (nickname) queryParams.nickname = nickname;
    if (status) queryParams.status = String(status);

    return unwrap(client.api.user.list.$get({ query: queryParams }));
  },

  /** 创建用户。 */
  create: (data: UserCreateParams) => unwrap(client.api.user.create.$post({ json: data })),

  /** 更新用户。 */
  update: (id: number, data: UserUpdateParams) =>
    unwrap(client.api.user[":id"].$put({ param: { id: String(id) }, json: data })),

  /** 删除用户。 */
  remove: (id: number) => unwrap(client.api.user[":id"].$delete({ param: { id: String(id) } })),

  /** 批量删除用户。 */
  batchRemove: (ids: number[]) => unwrap(client.api.user["batch-delete"].$post({ json: { ids } })),
};

export const userKeys = {
  all: ["user"] as const,
  list: () => [...userKeys.all, "list"] as const,
};
