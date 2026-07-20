/**
 * SystemOnline API 模块
 *
 * 基于 Hono RPC 客户端推导
 */

import { client, unwrap } from "@/service/client";

import type { OnlineUserSearchParams } from "./types";

export const onlineApi = {
  /** 强制退线 (踢人下线) */
  kickout: (userId: number) =>
    unwrap(client.api["system-online"].kickout.$post({ json: { userId } })),

  /** 在线用户列表 */
  list: (params?: OnlineUserSearchParams) =>
    unwrap(
      client.api["system-online"].list.$get({
        query: params?.username ? { username: params.username } : {},
      }),
    ),
};

export const onlineKeys = {
  all: ["online"] as const,
  list: (params?: OnlineUserSearchParams) => [...onlineKeys.all, "list", params] as const,
};
