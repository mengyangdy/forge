/**
 * 认证模块 API
 *
 * 基于 Hono RPC 客户端推导，零手动类型定义
 */

import { getToken } from "@/features/auth/use-auth";
import { client, unwrap } from "@/service/client";

export type LoginParams = Parameters<typeof client.api.auth.login.$post>[0]["json"];
export type RegisterParams = Parameters<typeof client.api.auth.register.$post>[0]["json"];
export type ResetPasswordParams = Parameters<
  (typeof client.api.auth)["reset-password"]["$post"]
>[0]["json"];

/**
 * 登录
 */
export function fetchLogin(params: LoginParams) {
  return unwrap(client.api.auth.login.$post({ json: params }));
}

/**
 * 获取当前用户信息
 */
export function fetchGetUserInfo() {
  const token = getToken();
  if (!token) {
    return Promise.resolve(null);
  }

  return unwrap(client.api.auth.getUserInfo.$get());
}

/**
 * 刷新 Token
 */
export function fetchRefreshToken(refreshToken: string) {
  return unwrap(
    client.api.auth["refresh-token"].$post({
      json: { refreshToken },
    }),
  );
}

/**
 * 登出
 */
export function fetchLogout(userId = 0) {
  return unwrap(
    client.api.auth.logout.$post({
      json: { userId },
    }),
  );
}

/**
 * 注册
 */
export function fetchRegister(params: RegisterParams) {
  return unwrap(
    client.api.auth.register.$post({
      json: params,
    }),
  );
}

/**
 * 重置密码
 */
export function fetchResetPassword(params: ResetPasswordParams) {
  return unwrap(
    client.api.auth["reset-password"].$post({
      json: params,
    }),
  );
}
