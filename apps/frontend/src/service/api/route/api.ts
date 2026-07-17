/**
 * 路由模块 API
 *
 * 合并了 urls.ts，URL 常量直接定义在这里
 */

import { request } from "../../request";

// ============================================================================
// URL 常量（原 urls.ts）
// ============================================================================

const URLS = {
  GET_USER_ROUTES: "/api/route/getReactUserRoutes",
} as const;

// ============================================================================
// API 函数
// ============================================================================

/**
 * 获取用户路由菜单
 */
export function fetchGetBackendRoutes() {
  return request<Api.Route.BackendRouteResponse>({ url: URLS.GET_USER_ROUTES }).then(
    (res) => res.data,
  );
}
