import { Modal, Notification, Toast } from "@douyinfe/semi-ui";
import type { ReactNode } from "react";

type ToastArg =
  | string
  | {
      content?: ReactNode;
      duration?: number;
      id?: string;
      key?: React.Key;
      onClose?: () => void;
    };

type NotificationConfig = {
  actions?: ReactNode;
  content?: ReactNode;
  description?: ReactNode;
  duration?: number;
  id?: string;
  key?: React.Key;
  message?: ReactNode;
  onClose?: () => void;
  title?: ReactNode;
};

type ModalConfig = {
  cancelText?: string;
  content?: ReactNode;
  keyboard?: boolean;
  maskClosable?: boolean;
  okText?: string;
  onCancel?: () => void;
  onOk?: () => void;
  title?: ReactNode;
};

function resolveToastContent(arg: ToastArg): {
  content: ReactNode;
  duration?: number;
  id?: string;
  onClose?: () => void;
} {
  if (typeof arg === "string") {
    return { content: arg };
  }

  return {
    content: arg.content ?? "",
    duration: arg.duration,
    id: arg.id ?? (arg.key != null ? String(arg.key) : undefined),
    onClose: arg.onClose,
  };
}

function openToast(
  type: "success" | "error" | "info" | "warning" | "default",
  ...args: [ToastArg] | [ToastArg, number?, (() => void)?]
) {
  const [first, durationArg, onCloseArg] = args;
  const resolved = resolveToastContent(first);
  const opts = {
    content: resolved.content,
    duration: typeof first === "string" ? durationArg : (resolved.duration ?? durationArg),
    id: resolved.id,
    onClose: typeof first === "string" ? onCloseArg : (resolved.onClose ?? onCloseArg),
  };

  switch (type) {
    case "success":
      return Toast.success(opts);
    case "error":
      return Toast.error(opts);
    case "info":
      return Toast.info(opts);
    case "warning":
      return Toast.warning(opts);
    default:
      return Toast.info(opts);
  }
}

/** @deprecated 使用 showSemiSuccessToast */
export function showSemiSuccessToast(content: ToastArg) {
  return openToast("success", content);
}

/** @deprecated 使用 showSemiErrorToast */
export function showSemiErrorToast(content: ToastArg) {
  return openToast("error", content);
}

export function showSemiInfoToast(content: ToastArg) {
  return openToast("info", content);
}

export function showSemiWarningToast(content: ToastArg) {
  return openToast("warning", content);
}

export function destroySemiToast(id?: string) {
  if (id) {
    Toast.close(id);
    return;
  }
  Toast.destroyAll();
}

export function showSemiConfirmModal(options: Parameters<typeof Modal.confirm>[0]) {
  return Modal.confirm(options);
}

// ---------------------------------------------------------------------------
// Compat aliases（历史 message / Modal / Notification API 形状，实现为 Semi）
// ---------------------------------------------------------------------------

export const showSuccessMessage = (...args: [ToastArg] | [ToastArg, number?, (() => void)?]) =>
  openToast("success", ...args);

export const showErrorMessage = (...args: [ToastArg] | [ToastArg, number?, (() => void)?]) =>
  openToast("error", ...args);

export const showInfoMessage = (...args: [ToastArg] | [ToastArg, number?, (() => void)?]) =>
  openToast("info", ...args);

export const showWarningMessage = (...args: [ToastArg] | [ToastArg, number?, (() => void)?]) =>
  openToast("warning", ...args);

export const showLoadingMessage = (...args: [ToastArg] | [ToastArg, number?, (() => void)?]) =>
  openToast("info", ...args);

export function showMessage(config: ToastArg) {
  return openToast("info", config);
}

export function destroyMessage(key?: React.Key) {
  destroySemiToast(key != null ? String(key) : undefined);
}

function resolveNotification(config: NotificationConfig) {
  const id = config.id ?? (config.key != null ? String(config.key) : undefined);
  const title = config.title ?? config.message;
  const body = (
    <>
      {config.description ?? config.content}
      {config.actions ? <div className="mt-12px">{config.actions}</div> : null}
    </>
  );

  return {
    content: body,
    duration: config.duration,
    id,
    onClose: config.onClose,
    title,
  };
}

export function showNotification(config: NotificationConfig) {
  return Notification.info(resolveNotification(config));
}

export function destroyNotification(key?: React.Key) {
  if (key == null) {
    Notification.destroyAll();
    return;
  }
  Notification.close(String(key));
}

export function showSuccessNotification(config: NotificationConfig) {
  return Notification.success(resolveNotification(config));
}

export function showErrorNotification(config: NotificationConfig) {
  return Notification.error(resolveNotification(config));
}

export function showInfoNotification(config: NotificationConfig) {
  return Notification.info(resolveNotification(config));
}

export function showWarningNotification(config: NotificationConfig) {
  return Notification.warning(resolveNotification(config));
}

function resolveModal(config: ModalConfig = {}) {
  return {
    cancelText: config.cancelText,
    content: config.content,
    maskClosable: config.maskClosable,
    okText: config.okText,
    onCancel: config.onCancel,
    onOk: config.onOk,
    title: config.title,
  };
}

export function showModal(config?: ModalConfig) {
  return Modal.confirm(resolveModal(config));
}

export function showConfirmModal(config?: ModalConfig) {
  return Modal.confirm(resolveModal(config));
}

export function showInfoModal(config?: ModalConfig) {
  return Modal.info(resolveModal(config));
}

export function showSuccessModal(config?: ModalConfig) {
  return Modal.success(resolveModal(config));
}

export function showErrorModal(config?: ModalConfig) {
  return Modal.error(resolveModal(config));
}

export function showWarningModal(config?: ModalConfig) {
  return Modal.warning(resolveModal(config));
}
