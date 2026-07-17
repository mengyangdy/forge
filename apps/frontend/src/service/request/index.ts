/**
 * Axios 请求实例
 *
 * 核心功能：Token 注入、响应格式化、错误处理
 */

import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "axios";

import { getServiceBaseURL } from "@/utils/service";
import { localStg } from "@/utils/storage";

// ============================================================================
// 配置
// ============================================================================

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === "Y";
const { baseURL, otherBaseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

// 成功码（与后端一致）
const SUCCESS_CODE = 0;

export interface ResponseEnvelope<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface RequestConfig<T = unknown> extends AxiosRequestConfig<T> {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
}

// ============================================================================
// 主服务实例
// ============================================================================

let refreshTokenPromise: Promise<{ refreshToken: string; token: string }> | null = null;

const instance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器：注入 Token
instance.interceptors.request.use((config) => {
  const token = localStg.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一处理
instance.interceptors.response.use(
  (response): any => {
    const { data } = response;
    const envelope = data as ResponseEnvelope;

    // 业务成功判断：只认 code === 0
    if (envelope.code === SUCCESS_CODE) {
      return envelope;
    }

    // 业务失败：根据错误码处理
    handleBusinessError(envelope);
    return Promise.reject(new Error(envelope.message || "请求失败"));
  },
  async (error: AxiosError<ResponseEnvelope>) => {
    const { response } = error;
    const requestConfig = error.config as RequestConfig | undefined;

    if (response) {
      const { status, data } = response;

      // 401: Token 过期或未登录 —— 通过 adapter 做 SPA 内跳转，保留路由状态
      if (status === 401) {
        if (requestConfig?.skipAuthRefresh || requestConfig?._retry) {
          await redirectToLogin();
          return Promise.reject(new Error("登录已过期，请重新登录"));
        }

        const refreshToken = localStg.get("refreshToken");
        if (!refreshToken || !requestConfig) {
          await redirectToLogin();
          return Promise.reject(new Error("登录已过期，请重新登录"));
        }

        try {
          const nextAuth = await refreshAccessToken(refreshToken);

          requestConfig._retry = true;
          requestConfig.headers = requestConfig.headers ?? {};
          requestConfig.headers.Authorization = `Bearer ${nextAuth.token}`;

          return instance(requestConfig);
        } catch {
          await redirectToLogin();
          return Promise.reject(new Error("登录已过期，请重新登录"));
        }
      }

      // 403: 无权限
      if (status === 403) {
        return Promise.reject(new Error("无权限访问"));
      }

      // 其他 HTTP 错误
      return Promise.reject(new Error(data?.message || `请求错误 (${status})`));
    }

    // 网络错误
    return Promise.reject(new Error("网络连接失败，请检查您的网络"));
  },
);

/**
 * 业务错误处理（根据后端错误码分类）
 *
 * 错误码约定（可按实际后端调整）：
 * - 10000-19999: 认证错误（token 失效、账号被封等）
 * - 20000-29999: 权限错误（无权访问该资源）
 * - 30000-39999: 用户错误（账号不存在等）
 * - 40000-49999: 参数验证错误
 * - 50000-59999: 文件错误
 * - 60000-69999: 系统错误
 * - 70000-79999: 业务逻辑错误
 */
function handleBusinessError(data: ResponseEnvelope) {
  const { code, message } = data;

  // 认证错误：清除本地 token，redirectToLogin 由 401 拦截器处理
  if (code >= 10000 && code <= 19999) {
    void resetAuthAndRedirect();
    return;
  }

  // 权限错误：toast 提示
  if (code >= 20000 && code <= 29999) {
    void import("../adapter").then(({ requestAdapter }) => {
      requestAdapter.showErrorMessage(message || "权限不足，无法执行此操作");
    });
    return;
  }

  // 参数验证错误：toast 提示
  if (code >= 40000 && code <= 49999) {
    void import("../adapter").then(({ requestAdapter }) => {
      requestAdapter.showErrorMessage(message || "请求参数有误，请检查后重试");
    });
    return;
  }

  // 其他业务错误：toast 提示（message 由后端返回）
  if (message) {
    void import("../adapter").then(({ requestAdapter }) => {
      requestAdapter.showErrorMessage(message);
    });
  }
}

// ============================================================================
// 导出请求方法
// ============================================================================

/**
 * 通用请求
 */
export async function request<T = any>(config: RequestConfig): Promise<ResponseEnvelope<T>> {
  return instance(config) as Promise<ResponseEnvelope<T>>;
}

/**
 * GET 请求
 */
export async function get<T = any>(
  url: string,
  params?: Record<string, any>,
): Promise<ResponseEnvelope<T>> {
  return instance({ method: "GET", url, params }) as Promise<ResponseEnvelope<T>>;
}

/**
 * POST 请求
 */
export async function post<T = any>(url: string, data?: any): Promise<ResponseEnvelope<T>> {
  return instance({ method: "POST", url, data }) as Promise<ResponseEnvelope<T>>;
}

/**
 * PUT 请求
 */
export async function put<T = any>(url: string, data?: any): Promise<ResponseEnvelope<T>> {
  return instance({ method: "PUT", url, data }) as Promise<ResponseEnvelope<T>>;
}

/**
 * DELETE 请求
 */
export async function del<T = any>(
  url: string,
  params?: Record<string, any>,
): Promise<ResponseEnvelope<T>> {
  return instance({ method: "DELETE", url, params }) as Promise<ResponseEnvelope<T>>;
}

// ============================================================================
// Demo 服务（备用）
// ============================================================================

const demoInstance = axios.create({
  baseURL: otherBaseURL.demo,
  timeout: 30000,
});

export async function demoRequest<T = any>(
  config: AxiosRequestConfig,
): Promise<ResponseEnvelope<T>> {
  return demoInstance(config) as Promise<ResponseEnvelope<T>>;
}

async function getRequestAdapter() {
  const { requestAdapter } = await import("../adapter");
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

async function redirectToLogin(redirectPath = window.location.href) {
  const adapter = await getRequestAdapter();
  adapter.resetAuth();
  adapter.redirectToLogin(redirectPath);
}

async function resetAuthAndRedirect(redirectPath = window.location.href) {
  const adapter = await getRequestAdapter();
  adapter.resetAuth();
  adapter.redirectToLogin(redirectPath);
}
