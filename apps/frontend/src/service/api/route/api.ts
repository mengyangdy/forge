/**
 * 路由模块 API
 *
 * 基于 Hono RPC 客户端推导
 */

import { client, unwrap } from "@/service/client";

/**
 * 获取用户路由菜单
 */
export function fetchGetBackendRoutes() {
  return unwrap(client.api.route.getReactUserRoutes.$get());
}
