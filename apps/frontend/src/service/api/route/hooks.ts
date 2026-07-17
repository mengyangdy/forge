/**
 * 路由模块 Hooks
 *
 * 合并了 keys.ts，Query Keys 直接定义在这里
 */

import { queryOptions } from "@tanstack/react-query";

import { queryClient } from "@/service/queryClient";

import { AUTH_QUERY_KEYS } from "../auth/hooks";
import { fetchGetBackendRoutes } from "./api";

// ============================================================================
// Query Keys（原 keys.ts）
// ============================================================================

export const ROUTE_QUERY_KEYS = {
  USER_ROUTES: ["route", "userRoutes"] as const,
} as const;

// ============================================================================
// Query Options
// ============================================================================

/**
 * 菜单路由查询配置
 */
export function queryMenusOptions() {
  const enabled = Boolean(queryClient.getQueryData<Api.Auth.UserInfo>(AUTH_QUERY_KEYS.USER_INFO));
  const isDev = import.meta.env.DEV;

  return queryOptions({
    enabled,
    gcTime: isDev ? 1000 * 60 * 5 : Infinity,
    queryFn: fetchGetBackendRoutes,
    queryKey: ROUTE_QUERY_KEYS.USER_ROUTES,
    staleTime: isDev ? 1000 * 10 : Infinity,
  });
}
