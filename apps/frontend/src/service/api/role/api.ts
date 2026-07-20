/**
 * Role API 模块
 *
 * 基于 Hono RPC 客户端推导
 */

import { client, unwrap } from "@/service/client";

import type { RoleCreateParams, RoleSearchParams, RoleUpdateParams } from "./types";

export const roleApi = {
  list: (params: RoleSearchParams) => {
    const { current: page, size: pageSize, name, code, dataScope } = params;
    const queryParams: Record<string, string> = {
      page: String(page),
      pageSize: String(pageSize),
    };
    if (name) queryParams.name = name;
    if (code) queryParams.code = code;
    if (dataScope) queryParams.dataScope = dataScope;

    return unwrap(client.api.role.list.$get({ query: queryParams }));
  },

  detail: (id: number) => {
    return unwrap(client.api.role[":id"].$get({ param: { id: String(id) } }));
  },

  create: (data: RoleCreateParams) => {
    return unwrap(client.api.role.create.$post({ json: data }));
  },

  update: (id: number, data: RoleUpdateParams) => {
    return unwrap(client.api.role[":id"].$put({ param: { id: String(id) }, json: data }));
  },

  remove: (id: number) => {
    return unwrap(client.api.role[":id"].$delete({ param: { id: String(id) } }));
  },

  batchRemove: (ids: number[]) => {
    return unwrap(client.api.role["batch-delete"].$post({ json: { ids } }));
  },
};

export const roleKeys = {
  all: ["role"] as const,
  list: () => [...roleKeys.all, "list"] as const,
  listAll: () => [...roleKeys.all, "list-all"] as const,
};
