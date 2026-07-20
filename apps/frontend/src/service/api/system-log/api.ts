/**
 * SystemLog API 模块
 *
 * 基于 Hono RPC 客户端推导
 */

import type { PaginatingQueryRecord } from "@/shared/web-ui-compose";
import { client, unwrap } from "@/service/client";

import type {
  AccessLogItem,
  AccessLogSearchParams,
  OperationLogItem,
  OperationLogSearchParams,
} from "./types";

/**
 * 分页获取系统访问日志列表
 */
export async function getAccessLogList(params: AccessLogSearchParams) {
  const { current, size, username, method, status } = params;
  const queryParams: Record<string, string> = {};
  if (current !== undefined) queryParams.page = String(current);
  if (size !== undefined) queryParams.pageSize = String(size);
  if (username) queryParams.username = username;
  if (method) queryParams.method = method;
  if (status !== undefined) queryParams.status = String(status);

  const data = await unwrap(client.api["system-log"].access.list.$get({ query: queryParams }));

  const record: PaginatingQueryRecord<AccessLogItem> = {
    current: current ?? 1,
    records: (data as any)?.list ?? [],
    size: size ?? 10,
    total: (data as any)?.total ?? 0,
  };
  return record;
}

/**
 * 分页获取业务操作日志列表
 */
export async function getOperationLogList(params: OperationLogSearchParams) {
  const { current, size, username, action, module, status } = params;
  const queryParams: Record<string, string> = {};
  if (current !== undefined) queryParams.page = String(current);
  if (size !== undefined) queryParams.pageSize = String(size);
  if (username) queryParams.username = username;
  if (action) queryParams.action = action;
  if (module) queryParams.module = module;
  if (status !== undefined) queryParams.status = String(status);

  const data = await unwrap(client.api["system-log"].operation.list.$get({ query: queryParams }));

  const record: PaginatingQueryRecord<OperationLogItem> = {
    current: current ?? 1,
    records: (data as any)?.list ?? [],
    size: size ?? 10,
    total: (data as any)?.total ?? 0,
  };
  return record;
}

export const systemLogApi = {
  getAccessLogList,
  getOperationLogList,
};
