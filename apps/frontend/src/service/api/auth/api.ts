/**
 * 认证模块 API
 *
 * 合并了 urls.ts，URL 常量直接定义在这里，更直观易维护
 */

import { getToken } from "@/features/auth/use-auth";

import { request } from "../../request";

// ============================================================================
// URL 常量（原 urls.ts）
// ============================================================================

const URLS = {
  LOGIN: "/api/auth/login",
  GET_USER_INFO: "/api/auth/getUserInfo",
  REFRESH_TOKEN: "/api/auth/refresh-token",
  LOGOUT: "/api/auth/logout",
} as const;

// ============================================================================
// API 函数
// ============================================================================

/**
 * 登录
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request<Api.Auth.LoginResponse>({
    data: params,
    method: "post",
    url: URLS.LOGIN,
  }).then((res) => res.data);
}

/**
 * 获取当前用户信息
 */
export function fetchGetUserInfo() {
  const token = getToken();
  if (!token) {
    return Promise.resolve(null);
  }

  return request<Api.Auth.UserInfo>({ url: URLS.GET_USER_INFO }).then((res) => res.data);
}

/**
 * 刷新 Token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    data: { refreshToken },
    method: "post",
    skipAuthRefresh: true,
    url: URLS.REFRESH_TOKEN,
  }).then((res) => res.data);
}

/**
 * 登出
 */
export function fetchLogout() {
  return request<void>({
    method: "post",
    url: URLS.LOGOUT,
  });
}

/**
 * 注册
 */
export function fetchRegister(params: Api.Auth.RegisterParams) {
  return request({
    data: {
      username: params.phone,
      password: params.password,
      nickname: params.phone,
      phone: params.phone,
    },
    method: "post",
    url: "/api/auth/register",
  }).then((res) => res.data);
}

/**
 * 重置密码
 */
export function fetchResetPassword(params: Api.Auth.ResetPasswordParams) {
  return request({
    data: {
      phone: params.phone,
      password: params.password,
      code: params.code,
    },
    method: "post",
    url: "/api/auth/reset-password",
  }).then((res) => res.data);
}
