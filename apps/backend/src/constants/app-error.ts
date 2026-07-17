/**
 * 自定义业务错误类
 * 用于统一处理业务逻辑中的错误
 */

import type { ErrorCodeDefinition } from "./error-codes.js";
import { ERROR_CODES } from "./error-codes.js";

/**
 * 业务错误类
 * 扩展原生 Error，增加数字错误码和 HTTP 状态码
 */
export class AppError extends Error {
  public readonly code: number; // 数字错误码
  public readonly httpStatus: number; // HTTP 状态码
  public readonly type?: string; // 错误类型标识
  public readonly isOperational: boolean; // 是否为可操作错误

  constructor(
    errorDef: ErrorCodeDefinition,
    customMessage?: string,
    isOperational: boolean = true,
  ) {
    super(customMessage || errorDef.message);
    this.code = errorDef.code;
    this.httpStatus = errorDef.httpStatus;
    this.type = errorDef.type;
    this.isOperational = isOperational;

    // 确保原型链正确
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * 转换为 JSON 格式
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      type: this.type,
    };
  }
}

/**
 * 快速创建错误的方法
 */

// HTTP 错误
export const createHttpError = {
  badRequest: (message?: string) => new AppError(ERROR_CODES.BAD_REQUEST, message),
  unauthorized: (message?: string) => new AppError(ERROR_CODES.UNAUTHORIZED, message),
  forbidden: (message?: string) => new AppError(ERROR_CODES.FORBIDDEN, message),
  notFound: (message?: string) => new AppError(ERROR_CODES.NOT_FOUND, message),
  conflict: (message?: string) => new AppError(ERROR_CODES.CONFLICT, message),
  tooManyRequests: (message?: string) => new AppError(ERROR_CODES.TOO_MANY_REQUESTS, message),
  internal: (message?: string) => new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, message),
};

// 认证错误
export const createAuthError = {
  usernameNotFound: () => new AppError(ERROR_CODES.LOGIN_USERNAME_NOT_FOUND),
  passwordIncorrect: () => new AppError(ERROR_CODES.LOGIN_PASSWORD_INCORRECT),
  accountDisabled: () => new AppError(ERROR_CODES.LOGIN_ACCOUNT_DISABLED),
  accountLocked: () => new AppError(ERROR_CODES.LOGIN_ACCOUNT_LOCKED),
  tokenMissing: () => new AppError(ERROR_CODES.TOKEN_MISSING),
  tokenInvalid: () => new AppError(ERROR_CODES.TOKEN_INVALID),
  tokenExpired: () => new AppError(ERROR_CODES.TOKEN_EXPIRED),
  sessionExpired: () => new AppError(ERROR_CODES.SESSION_EXPIRED),
  sessionKickedOut: () => new AppError(ERROR_CODES.SESSION_KICKED_OUT),
};

// 权限错误
export const createPermError = {
  notLogin: () => new AppError(ERROR_CODES.NOT_LOGIN),
  permissionDenied: (permission?: string) =>
    new AppError(ERROR_CODES.PERMISSION_DENIED, permission ? `缺少权限：${permission}` : undefined),
  roleDenied: (role?: string) =>
    new AppError(ERROR_CODES.ROLE_DENIED, role ? `缺少角色：${role}` : undefined),
};

// 用户错误
export const createUserError = {
  notFound: () => new AppError(ERROR_CODES.NOT_FOUND),
  alreadyExists: () => new AppError(ERROR_CODES.ALREADY_EXISTS),
  passwordNotMatch: () => new AppError(ERROR_CODES.PASSWORD_NOT_MATCH),
  oldPasswordIncorrect: () => new AppError(ERROR_CODES.OLD_PASSWORD_INCORRECT),
  cannotDeleteSelf: () => new AppError(ERROR_CODES.CANNOT_DELETE_SELF),
};

// 验证错误
export const createValidError = {
  requiredField: (field?: string) =>
    new AppError(ERROR_CODES.REQUIRED_FIELD_MISSING, field ? `${field} 不能为空` : undefined),
  invalidFormat: (field?: string) =>
    new AppError(ERROR_CODES.INVALID_FORMAT, field ? `${field} 格式不正确` : undefined),
  invalidEmail: () => new AppError(ERROR_CODES.INVALID_EMAIL),
  invalidPhone: () => new AppError(ERROR_CODES.INVALID_PHONE),
};

// 文件错误
export const createFileError = {
  tooLarge: (maxSize?: string) =>
    new AppError(ERROR_CODES.FILE_TOO_LARGE, maxSize ? `文件大小不能超过 ${maxSize}` : undefined),
  invalidType: (types?: string[]) =>
    new AppError(
      ERROR_CODES.INVALID_FILE_TYPE,
      types ? `仅支持 ${types.join(", ")} 格式的文件` : undefined,
    ),
  notFound: () => new AppError(ERROR_CODES.FILE_NOT_FOUND),
  uploadFailed: () => new AppError(ERROR_CODES.UPLOAD_FAILED),
};

// 业务错误
export const createBizError = {
  dataNotFound: () => new AppError(ERROR_CODES.DATA_NOT_FOUND),
  dataAlreadyExists: () => new AppError(ERROR_CODES.DATA_ALREADY_EXISTS),
  departmentAlreadyExists: () => new AppError(ERROR_CODES.DEPARTMENT_ALREADY_EXISTS),
  operationFailed: (message?: string) => new AppError(ERROR_CODES.OPERATION_FAILED, message),
  statusInvalid: () => new AppError(ERROR_CODES.STATUS_INVALID),
  departmentHasUsers: () => new AppError(ERROR_CODES.DEPARTMENT_HAS_USERS),
  departmentHasChildren: () => new AppError(ERROR_CODES.DEPARTMENT_HAS_CHILDREN),
};

/**
 * 判断是否为 AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

/**
 * 从错误对象中提取错误信息
 */
export function extractErrorInfo(error: any): {
  code: number;
  message: string;
  httpStatus: number;
  type?: string;
} {
  if (isAppError(error)) {
    return {
      code: error.code,
      message: error.message,
      httpStatus: error.httpStatus,
      type: error.type,
    };
  }

  // 默认返回 500 错误
  return {
    code: ERROR_CODES.INTERNAL_SERVER_ERROR.code,
    message: error.message || "服务器内部错误",
    httpStatus: 500,
    type: "UNKNOWN_ERROR",
  };
}
