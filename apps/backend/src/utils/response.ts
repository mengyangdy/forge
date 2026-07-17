/**
 * 统一响应格式工具
 *
 * 所有接口返回格式：{ code, message, data }
 */

import { SUCCESS_CODE } from "../constants/error-codes.js";

/**
 * 统一响应格式类型
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 成功响应
 *
 * @example
 * return c.json(success(user, "获取用户成功"));
 */
export function success<T>(data: T, message: string = "操作成功"): ApiResponse<T> {
  return {
    code: SUCCESS_CODE,
    message,
    data,
  };
}

/**
 * 分页成功响应
 *
 * @example
 * return c.json(successPaginate(list, total, page, pageSize));
 */
export function successPaginate<T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = "查询成功",
): ApiResponse<{
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}> {
  return {
    code: SUCCESS_CODE,
    message,
    data: {
      list,
      total,
      page,
      pageSize,
    },
  };
}

/**
 * 无数据成功响应（用于删除、更新等操作）
 *
 * @example
 * return c.json(successNoData("删除成功"));
 */
export function successNoData(message: string = "操作成功"): ApiResponse<null> {
  return {
    code: SUCCESS_CODE,
    message,
    data: null,
  };
}
