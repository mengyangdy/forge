/**
 * 统一错误码定义（数字格式）
 *
 * 编码规则：
 * - 0: 成功
 * - 10000-19999: 认证相关错误
 * - 20000-29999: 权限相关错误
 * - 30000-39999: 用户相关错误
 * - 40000-49999: 数据验证相关错误
 * - 50000-59999: 文件上传相关错误
 * - 60000-69999: 系统相关错误
 * - 70000-79999: 业务逻辑相关错误
 * - 80000-89999: HTTP相关错误
 *
 * HTTP状态码保持原有：400, 401, 403, 404, 500等
 */

/**
 * 成功码定义
 */
export const SUCCESS_CODE = 0;

/**
 * 错误码类型定义
 */
export interface ErrorCodeDefinition {
  code: number; // 数字错误码
  message: string; // 错误消息
  httpStatus: number; // HTTP状态码
  type?: string; // 错误类型标识（可选）
}

/**
 * HTTP 相关错误（80000-89999）
 */
export const HTTP_ERRORS = {
  BAD_REQUEST: {
    code: 80001,
    message: "请求参数错误",
    httpStatus: 400,
    type: "BAD_REQUEST",
  },
  UNAUTHORIZED: {
    code: 80002,
    message: "未授权访问，请先登录",
    httpStatus: 401,
    type: "UNAUTHORIZED",
  },
  FORBIDDEN: {
    code: 80003,
    message: "权限不足，拒绝访问",
    httpStatus: 403,
    type: "FORBIDDEN",
  },
  NOT_FOUND: {
    code: 80004,
    message: "请求的资源不存在",
    httpStatus: 404,
    type: "NOT_FOUND",
  },
  METHOD_NOT_ALLOWED: {
    code: 80005,
    message: "不支持的请求方法",
    httpStatus: 405,
    type: "METHOD_NOT_ALLOWED",
  },
  CONFLICT: {
    code: 80006,
    message: "资源冲突",
    httpStatus: 409,
    type: "CONFLICT",
  },
  PAYLOAD_TOO_LARGE: {
    code: 80007,
    message: "请求数据过大",
    httpStatus: 413,
    type: "PAYLOAD_TOO_LARGE",
  },
  UNPROCESSABLE_ENTITY: {
    code: 80008,
    message: "请求参数验证失败",
    httpStatus: 422,
    type: "UNPROCESSABLE_ENTITY",
  },
  TOO_MANY_REQUESTS: {
    code: 80009,
    message: "请求过于频繁，请稍后再试",
    httpStatus: 429,
    type: "TOO_MANY_REQUESTS",
  },
  INTERNAL_SERVER_ERROR: {
    code: 80010,
    message: "服务器内部错误",
    httpStatus: 500,
    type: "INTERNAL_SERVER_ERROR",
  },
  BAD_GATEWAY: {
    code: 80011,
    message: "网关错误",
    httpStatus: 502,
    type: "BAD_GATEWAY",
  },
  SERVICE_UNAVAILABLE: {
    code: 80012,
    message: "服务暂时不可用",
    httpStatus: 503,
    type: "SERVICE_UNAVAILABLE",
  },
  GATEWAY_TIMEOUT: {
    code: 80013,
    message: "网关超时",
    httpStatus: 504,
    type: "GATEWAY_TIMEOUT",
  },
} as const;

/**
 * 认证相关错误（10000-19999）
 * 子分类：
 * - 10001-10099: 登录相关
 * - 10101-10199: Token相关
 * - 10201-10299: 会话相关
 * - 10301-10399: 注册相关
 */
export const AUTH_ERRORS = {
  // 登录相关（10001-10099）
  LOGIN_USERNAME_NOT_FOUND: {
    code: 10001,
    message: "用户名不存在",
    httpStatus: 400,
    type: "LOGIN_USERNAME_NOT_FOUND",
  },
  LOGIN_PASSWORD_INCORRECT: {
    code: 10002,
    message: "密码错误",
    httpStatus: 400,
    type: "LOGIN_PASSWORD_INCORRECT",
  },
  LOGIN_ACCOUNT_DISABLED: {
    code: 10003,
    message: "账号已被禁用，请联系管理员",
    httpStatus: 400,
    type: "LOGIN_ACCOUNT_DISABLED",
  },
  LOGIN_ACCOUNT_LOCKED: {
    code: 10004,
    message: "账号已被锁定，请稍后再试",
    httpStatus: 400,
    type: "LOGIN_ACCOUNT_LOCKED",
  },
  LOGIN_TOO_MANY_ATTEMPTS: {
    code: 10005,
    message: "登录失败次数过多，账号已被锁定 30 分钟",
    httpStatus: 400,
    type: "LOGIN_TOO_MANY_ATTEMPTS",
  },

  // Token相关（10101-10199）
  TOKEN_MISSING: {
    code: 10101,
    message: "缺少 Authorization Bearer Token",
    httpStatus: 401,
    type: "TOKEN_MISSING",
  },
  TOKEN_INVALID: {
    code: 10102,
    message: "登录凭证已过期或无效",
    httpStatus: 401,
    type: "TOKEN_INVALID",
  },
  TOKEN_EXPIRED: {
    code: 10103,
    message: "登录凭证已过期，请重新登录",
    httpStatus: 401,
    type: "TOKEN_EXPIRED",
  },
  TOKEN_REFRESH_FAILED: {
    code: 10104,
    message: "刷新令牌失败，请重新登录",
    httpStatus: 401,
    type: "TOKEN_REFRESH_FAILED",
  },

  // 会话相关（10201-10299）
  SESSION_EXPIRED: {
    code: 10201,
    message: "会话已过期，请重新登录",
    httpStatus: 401,
    type: "SESSION_EXPIRED",
  },
  SESSION_KICKED_OUT: {
    code: 10202,
    message: "您的会话已失效，或已被管理员强制下线，请重新登录",
    httpStatus: 401,
    type: "SESSION_KICKED_OUT",
  },
  SESSION_NOT_FOUND: {
    code: 10203,
    message: "会话不存在，请重新登录",
    httpStatus: 401,
    type: "SESSION_NOT_FOUND",
  },

  // 注册相关（10301-10399）
  REGISTER_USERNAME_EXISTS: {
    code: 10301,
    message: "用户名已被注册",
    httpStatus: 400,
    type: "REGISTER_USERNAME_EXISTS",
  },
  REGISTER_EMAIL_EXISTS: {
    code: 10302,
    message: "邮箱已被注册",
    httpStatus: 400,
    type: "REGISTER_EMAIL_EXISTS",
  },
  REGISTER_PHONE_EXISTS: {
    code: 10303,
    message: "手机号已被注册",
    httpStatus: 400,
    type: "REGISTER_PHONE_EXISTS",
  },
} as const;

/**
 * 权限相关错误（20000-29999）
 */
export const PERMISSION_ERRORS = {
  NOT_LOGIN: {
    code: 20001,
    message: "未登录或登录状态失效",
    httpStatus: 401,
    type: "NOT_LOGIN",
  },
  PERMISSION_DENIED: {
    code: 20002,
    message: "权限不足，拒绝访问",
    httpStatus: 403,
    type: "PERMISSION_DENIED",
  },
  ROLE_DENIED: {
    code: 20003,
    message: "角色权限不足，拒绝访问",
    httpStatus: 403,
    type: "ROLE_DENIED",
  },
  SUPER_ADMIN_REQUIRED: {
    code: 20004,
    message: "需要超级管理员权限",
    httpStatus: 403,
    type: "SUPER_ADMIN_REQUIRED",
  },
  DATA_SCOPE_DENIED: {
    code: 20005,
    message: "无权访问该数据",
    httpStatus: 403,
    type: "DATA_SCOPE_DENIED",
  },
} as const;

/**
 * 用户相关错误（30000-39999）
 */
export const USER_ERRORS = {
  NOT_FOUND: {
    code: 30001,
    message: "用户不存在",
    httpStatus: 404,
    type: "USER_NOT_FOUND",
  },
  ALREADY_EXISTS: {
    code: 30002,
    message: "用户已存在",
    httpStatus: 400,
    type: "USER_ALREADY_EXISTS",
  },
  USERNAME_TOO_SHORT: {
    code: 30003,
    message: "用户名最少 2 个字符",
    httpStatus: 400,
    type: "USERNAME_TOO_SHORT",
  },
  USERNAME_TOO_LONG: {
    code: 30004,
    message: "用户名最多 50 个字符",
    httpStatus: 400,
    type: "USERNAME_TOO_LONG",
  },
  PASSWORD_TOO_SHORT: {
    code: 30005,
    message: "密码最少 6 位",
    httpStatus: 400,
    type: "PASSWORD_TOO_SHORT",
  },
  PASSWORD_NOT_MATCH: {
    code: 30006,
    message: "两次密码输入不一致",
    httpStatus: 400,
    type: "PASSWORD_NOT_MATCH",
  },
  OLD_PASSWORD_INCORRECT: {
    code: 30007,
    message: "原密码错误",
    httpStatus: 400,
    type: "OLD_PASSWORD_INCORRECT",
  },
  CANNOT_DELETE_SELF: {
    code: 30008,
    message: "不能删除自己",
    httpStatus: 400,
    type: "CANNOT_DELETE_SELF",
  },
  CANNOT_DISABLE_SELF: {
    code: 30009,
    message: "不能禁用自己",
    httpStatus: 400,
    type: "CANNOT_DISABLE_SELF",
  },
} as const;

/**
 * 数据验证相关错误（40000-49999）
 */
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD_MISSING: {
    code: 40001,
    message: "必填字段不能为空",
    httpStatus: 400,
    type: "REQUIRED_FIELD_MISSING",
  },
  INVALID_FORMAT: {
    code: 40002,
    message: "数据格式不正确",
    httpStatus: 400,
    type: "INVALID_FORMAT",
  },
  INVALID_EMAIL: {
    code: 40003,
    message: "邮箱格式不正确",
    httpStatus: 400,
    type: "INVALID_EMAIL",
  },
  INVALID_PHONE: {
    code: 40004,
    message: "手机号格式不正确",
    httpStatus: 400,
    type: "INVALID_PHONE",
  },
  INVALID_ID: {
    code: 40005,
    message: "ID 格式不正确",
    httpStatus: 400,
    type: "INVALID_ID",
  },
  INVALID_DATE: {
    code: 40006,
    message: "日期格式不正确",
    httpStatus: 400,
    type: "INVALID_DATE",
  },
  INVALID_NUMBER: {
    code: 40007,
    message: "数字格式不正确",
    httpStatus: 400,
    type: "INVALID_NUMBER",
  },
  INVALID_URL: {
    code: 40008,
    message: "URL 格式不正确",
    httpStatus: 400,
    type: "INVALID_URL",
  },
  STRING_TOO_LONG: {
    code: 40009,
    message: "字符串长度超出限制",
    httpStatus: 400,
    type: "STRING_TOO_LONG",
  },
  STRING_TOO_SHORT: {
    code: 40010,
    message: "字符串长度不足",
    httpStatus: 400,
    type: "STRING_TOO_SHORT",
  },
  NUMBER_OUT_OF_RANGE: {
    code: 40011,
    message: "数字超出范围",
    httpStatus: 400,
    type: "NUMBER_OUT_OF_RANGE",
  },
} as const;

/**
 * 文件上传相关错误（50000-59999）
 */
export const FILE_ERRORS = {
  FILE_TOO_LARGE: {
    code: 50001,
    message: "文件大小超出限制",
    httpStatus: 400,
    type: "FILE_TOO_LARGE",
  },
  INVALID_FILE_TYPE: {
    code: 50002,
    message: "不支持的文件类型",
    httpStatus: 400,
    type: "INVALID_FILE_TYPE",
  },
  FILE_NOT_FOUND: {
    code: 50003,
    message: "文件不存在",
    httpStatus: 404,
    type: "FILE_NOT_FOUND",
  },
  UPLOAD_FAILED: {
    code: 50004,
    message: "文件上传失败",
    httpStatus: 500,
    type: "UPLOAD_FAILED",
  },
  DELETE_FAILED: {
    code: 50005,
    message: "文件删除失败",
    httpStatus: 500,
    type: "DELETE_FAILED",
  },
  CHUNK_UPLOAD_FAILED: {
    code: 50006,
    message: "分片上传失败",
    httpStatus: 500,
    type: "CHUNK_UPLOAD_FAILED",
  },
  MERGE_FAILED: {
    code: 50007,
    message: "文件合并失败",
    httpStatus: 500,
    type: "MERGE_FAILED",
  },
} as const;

/**
 * 系统相关错误（60000-69999）
 */
export const SYSTEM_ERRORS = {
  REDIS_CONNECTION_FAILED: {
    code: 60001,
    message: "Redis 连接失败",
    httpStatus: 500,
    type: "REDIS_CONNECTION_FAILED",
  },
  DATABASE_CONNECTION_FAILED: {
    code: 60002,
    message: "数据库连接失败",
    httpStatus: 500,
    type: "DATABASE_CONNECTION_FAILED",
  },
  EXTERNAL_API_FAILED: {
    code: 60003,
    message: "外部接口调用失败",
    httpStatus: 500,
    type: "EXTERNAL_API_FAILED",
  },
  CONFIG_ERROR: {
    code: 60004,
    message: "系统配置错误",
    httpStatus: 500,
    type: "CONFIG_ERROR",
  },
  CACHE_ERROR: {
    code: 60005,
    message: "缓存操作失败",
    httpStatus: 500,
    type: "CACHE_ERROR",
  },
  TASK_EXECUTION_FAILED: {
    code: 60006,
    message: "任务执行失败",
    httpStatus: 500,
    type: "TASK_EXECUTION_FAILED",
  },
} as const;

/**
 * 业务逻辑相关错误（70000-79999）
 */
export const BUSINESS_ERRORS = {
  DATA_NOT_FOUND: {
    code: 70001,
    message: "数据不存在",
    httpStatus: 404,
    type: "DATA_NOT_FOUND",
  },
  DATA_ALREADY_EXISTS: {
    code: 70002,
    message: "数据已存在",
    httpStatus: 400,
    type: "DATA_ALREADY_EXISTS",
  },
  OPERATION_FAILED: {
    code: 70003,
    message: "操作失败",
    httpStatus: 500,
    type: "OPERATION_FAILED",
  },
  STATUS_INVALID: {
    code: 70004,
    message: "状态不正确，无法执行此操作",
    httpStatus: 400,
    type: "STATUS_INVALID",
  },
  DEPARTMENT_HAS_USERS: {
    code: 70005,
    message: "部门下存在用户，无法删除",
    httpStatus: 400,
    type: "DEPARTMENT_HAS_USERS",
  },
  ROLE_HAS_USERS: {
    code: 70006,
    message: "角色已分配给用户，无法删除",
    httpStatus: 400,
    type: "ROLE_HAS_USERS",
  },
  CANNOT_MODIFY_SUPER_ADMIN: {
    code: 70007,
    message: "不能修改超级管理员",
    httpStatus: 400,
    type: "CANNOT_MODIFY_SUPER_ADMIN",
  },
  DICT_TYPE_IN_USE: {
    code: 70008,
    message: "字典类型正在使用中，无法删除",
    httpStatus: 400,
    type: "DICT_TYPE_IN_USE",
  },
  DEPARTMENT_HAS_CHILDREN: {
    code: 70009,
    message: "部门下存在子部门，无法删除",
    httpStatus: 400,
    type: "DEPARTMENT_HAS_CHILDREN",
  },
  DEPARTMENT_ALREADY_EXISTS: {
    code: 70010,
    message: "部门名称已存在",
    httpStatus: 400,
    type: "DEPARTMENT_ALREADY_EXISTS",
  },
} as const;

/**
 * 所有错误码的联合类型
 */
export const ERROR_CODES = {
  ...HTTP_ERRORS,
  ...AUTH_ERRORS,
  ...PERMISSION_ERRORS,
  ...USER_ERRORS,
  ...VALIDATION_ERRORS,
  ...FILE_ERRORS,
  ...SYSTEM_ERRORS,
  ...BUSINESS_ERRORS,
} as const;

/**
 * 根据错误码数字获取错误信息
 */
export function getErrorByCode(code: number): ErrorCodeDefinition | undefined {
  return Object.values(ERROR_CODES).find((err) => err.code === code);
}

/**
 * 创建自定义错误
 */
export function createError(
  errorDef: ErrorCodeDefinition,
  customMessage?: string,
): { code: number; message: string; httpStatus: number; type?: string } {
  return {
    ...errorDef,
    message: customMessage || errorDef.message,
  };
}

/**
 * 错误码分类映射（用于前端判断错误类型）
 */
export const ERROR_CODE_RANGES = {
  AUTH: { min: 10000, max: 19999, name: "认证错误" },
  PERMISSION: { min: 20000, max: 29999, name: "权限错误" },
  USER: { min: 30000, max: 39999, name: "用户错误" },
  VALIDATION: { min: 40000, max: 49999, name: "验证错误" },
  FILE: { min: 50000, max: 59999, name: "文件错误" },
  SYSTEM: { min: 60000, max: 69999, name: "系统错误" },
  BUSINESS: { min: 70000, max: 79999, name: "业务错误" },
  HTTP: { min: 80000, max: 89999, name: "HTTP错误" },
} as const;

/**
 * 根据错误码判断错误类型
 */
export function getErrorCategory(code: number): string {
  for (const [_key, range] of Object.entries(ERROR_CODE_RANGES)) {
    if (code >= range.min && code <= range.max) {
      return range.name;
    }
  }
  return "未知错误";
}
