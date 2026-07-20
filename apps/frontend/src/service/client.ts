/**
 * Hono RPC 客户端
 *
 * 利用 @forge/backend 的 AppType 实现前后端类型推导与一体化请求
 */

import type { AppType } from "@forge/backend";
import type { InferRequestType, InferResponseType } from "hono/client";
import { hc } from "hono/client";

import { getServiceBaseURL } from "@/utils/service";
import { localStg } from "@/utils/storage";

// ============================================================================
// 基础配置
// ============================================================================

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === "Y";
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

export interface ResponseEnvelope<T = unknown> {
  code: number;
  message?: string;
  data: T;
}

let refreshTokenPromise: Promise<{ refreshToken: string; token: string }> | null = null;

async function getRequestAdapter() {
  const { requestAdapter } = await import("./adapter");
  return requestAdapter;
}

async function refreshAccessToken(refreshToken: string) {
  if (!refreshTokenPromise) {
    refreshTokenPromise = getRequestAdapter()
      .then((adapter) => adapter.fetchRefreshToken(refreshToken))
      .then((tokens) => {
        return getRequestAdapter().then((adapter) => {
          adapter.setAuth(tokens);
          return tokens;
        });
      })
      .finally(() => {
        refreshTokenPromise = null;
      });
  }

  return refreshTokenPromise;
}

async function resetAuthAndRedirect(
  redirectPath = window.location.pathname + window.location.search,
) {
  const adapter = await getRequestAdapter();
  adapter.resetAuth();
  adapter.redirectToLogin(redirectPath);
}

/**
 * 业务错误统一拦截处理
 */
function handleBusinessError(data: ResponseEnvelope) {
  const { code, message } = data;

  if (code >= 10000 && code <= 19999) {
    void resetAuthAndRedirect();
    return;
  }

  if ((code >= 20000 && code <= 29999) || (code >= 40000 && code <= 49999)) {
    void getRequestAdapter().then((adapter) => {
      adapter.showErrorMessage(message || "请求操作处理失败");
    });
    return;
  }

  if (message) {
    void getRequestAdapter().then((adapter) => {
      adapter.showErrorMessage(message);
    });
  }
}

/**
 * 自定义 fetch，处理 Authorization header 注入与 401 Refresh Token
 */
const customFetch: typeof fetch = async (input, init) => {
  const token = localStg.get("token");
  const headers = new Headers(init?.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    const refreshToken = localStg.get("refreshToken");
    if (refreshToken) {
      try {
        const nextAuth = await refreshAccessToken(refreshToken);
        headers.set("Authorization", `Bearer ${nextAuth.token}`);
        response = await fetch(input, {
          ...init,
          headers,
        });
      } catch {
        await resetAuthAndRedirect();
      }
    } else {
      await resetAuthAndRedirect();
    }
  }

  return response;
};

// ============================================================================
// Hono Client 实例
// ============================================================================

export const client = hc<AppType>(baseURL, {
  fetch: customFetch,
});

/**
 * 解包 RPC 响应（校验 HTTP 状态与 code 业务码，解出 envelope.data）
 */
export async function unwrap<T extends Response>(
  responsePromise: Promise<T>,
): Promise<
  T extends { json(): Promise<ResponseEnvelope<infer D>> }
    ? D
    : T extends { json(): Promise<infer JSON> }
      ? JSON extends ResponseEnvelope<infer D>
        ? D
        : JSON
      : unknown
> {
  const res = await responsePromise;
  if (!res.ok) {
    let errorMsg = `HTTP Error (${res.status})`;
    try {
      const errJson = (await res.json()) as ResponseEnvelope;
      if (errJson?.message) {
        errorMsg = errJson.message;
      }
    } catch {
      // 忽略 JSON 解析异常
    }
    void getRequestAdapter().then((adapter) => {
      adapter.showErrorMessage(errorMsg);
    });
    throw new Error(errorMsg);
  }

  const envelope = (await res.json()) as ResponseEnvelope;
  if (envelope && typeof envelope === "object" && "code" in envelope) {
    if (envelope.code === 0) {
      return envelope.data as any;
    }
    handleBusinessError(envelope);
    throw new Error(envelope.message || "请求失败");
  }

  return envelope as any;
}

// 导出常用的 Hono 推导助手类型
export type { InferRequestType, InferResponseType };
export type { AppType };
