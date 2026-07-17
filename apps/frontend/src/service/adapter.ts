import { setAuth } from "@/features/auth/use-auth";
import { getRouter } from "@/features/router/router-ref";
import { $t } from "@/locales";
import { localStg } from "@/utils/storage";
// showErrorMessage / showErrorModal 由 @/config 统一 re-export 自 @/shared/admin-theme
// unplugin-auto-import 会自动注入，此处显式 import 方便 IDE 跳转和代码可读性
import { showErrorMessage, showErrorModal } from "@/config";

import { fetchRefreshToken } from "./api/auth/api";

export interface RequestAdapter {
  /** 使用 refresh token 换取新 token */
  fetchRefreshToken(
    this: void,
    refreshToken: string,
  ): Promise<{ refreshToken: string; token: string }>;

  /** 获取当前路由路径 */
  getCurrentPath(this: void): string;

  /** 获取 refresh token */
  getRefreshToken(this: void): string | null;

  /** 获取 access token */
  getToken(this: void): string | null;

  /** 重定向到登录页 */
  redirectToLogin(this: void, redirectPath?: string): void;

  /** 清除认证信息 */
  resetAuth(this: void): void;

  /** 保存认证信息 */
  setAuth(this: void, tokens: { refreshToken: string; token: string }): void;

  /** 展示错误消息（toast / message） */
  showErrorMessage(this: void, msg: string, onClose?: () => void): void;

  /** 展示错误弹窗（modal / dialog） */
  showErrorModal(
    this: void,
    options: {
      content: string;
      maskClosable?: boolean;
      /** 点击取消按钮的回调，默认与 onConfirm 相同 */
      onCancel?: () => void;
      /** 点击确定按钮的回调 */
      onConfirm: () => void;
      title: string;
    },
  ): void;

  /** 国际化翻译 */
  t(this: void, key: string): string;
}

function showRequestErrorMessage(msg: string, onClose?: () => void) {
  if (onClose) {
    showErrorMessage({ content: msg, onClose });
    return;
  }

  showErrorMessage(msg);
}

function showRequestErrorModal(options: Parameters<RequestAdapter["showErrorModal"]>[0]) {
  showErrorModal({
    content: options.content,
    keyboard: false,
    maskClosable: options.maskClosable ?? false,
    okText: $t("common.confirm"),
    onCancel() {
      // 取消时优先调用 onCancel，若未提供则回退到 onConfirm（保持原有行为）
      (options.onCancel ?? options.onConfirm)();
    },
    onOk() {
      options.onConfirm();
    },
    title: options.title,
  });
}

export const requestAdapter: RequestAdapter = {
  fetchRefreshToken,
  getCurrentPath() {
    return getRouter().state.location.href;
  },
  getRefreshToken() {
    return localStg.get("refreshToken") || null;
  },
  getToken() {
    return localStg.get("token") || null;
  },
  redirectToLogin(redirectPath?: string) {
    // oxlint-disable-next-line no-void
    void getRouter().navigate({ search: { redirect: redirectPath }, to: "/login-out" });
  },
  resetAuth() {
    localStg.remove("token");
    localStg.remove("refreshToken");
  },
  setAuth(tokens) {
    setAuth({ refreshToken: tokens.refreshToken, token: tokens.token });
  },
  showErrorMessage: showRequestErrorMessage,
  showErrorModal: showRequestErrorModal,
  t(key: string) {
    return $t(key);
  },
};
