/**
 * 认证模块 Hooks
 */

import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import type { LoginParams, RegisterParams, ResetPasswordParams } from "./api";
import { fetchGetUserInfo, fetchLogin, fetchRegister, fetchResetPassword } from "./api";

export const AUTH_QUERY_KEYS = {
  USER_INFO: ["auth", "userInfo"] as const,
} as const;

export const AUTH_MUTATION_KEYS = {
  LOGIN: ["auth", "login"] as const,
  LOGOUT: ["auth", "logout"] as const,
} as const;

// ============================================================================
// Query Options（可复用的查询配置）
// ============================================================================

/**
 * 用户信息查询配置
 */
export function queryUserInfoOptions() {
  return queryOptions({
    gcTime: Infinity,
    queryFn: fetchGetUserInfo,
    queryKey: AUTH_QUERY_KEYS.USER_INFO,
    retry: false,
    staleTime: Infinity,
  });
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * 登录 Mutation
 */
export function useLoginMutation() {
  return useMutation({
    mutationFn: (params: LoginParams) => fetchLogin(params),
    mutationKey: AUTH_MUTATION_KEYS.LOGIN,
    retry: false,
  });
}

/**
 * 用户信息 Query
 */
export function useUserInfoQuery() {
  const query = queryUserInfoOptions();

  return useQuery(query);
}

/**
 * 注册 Mutation
 */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: (params: RegisterParams) => fetchRegister(params),
    mutationKey: ["auth", "register"] as const,
    retry: false,
  });
}

/**
 * 重置密码 Mutation
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (params: ResetPasswordParams) => fetchResetPassword(params),
    mutationKey: ["auth", "resetPassword"] as const,
    retry: false,
  });
}
