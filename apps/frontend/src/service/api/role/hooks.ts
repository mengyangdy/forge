/**
 * Role Query Hooks
 *
 * 为 useTable 提供 queryHook。后端列表暂不支持名称/编码过滤，
 * 这里拉取全量后做前端过滤分页，与菜单页保持一致。
 */

import { useQuery } from "@tanstack/react-query";
import type { PaginatingQueryRecord, SemiTableQueryHookOptions } from "@/shared/web-ui-compose";
import type { UseQueryOptions } from "@tanstack/react-query";

import { roleApi, roleKeys } from "./api";
import type { RoleListItem, RoleSearchParams } from "./types";

const ROLE_LIST_PAGE_SIZE = 10_000;

type RoleListQueryOptions<Data> = Omit<
  UseQueryOptions<RoleListItem[], Error, Data>,
  "queryFn" | "queryKey"
>;

function buildRolePage(list: RoleListItem[], params: RoleSearchParams) {
  const nameKeyword = params.name?.trim().toLowerCase();
  const codeKeyword = params.code?.trim().toLowerCase();

  const filtered = list.filter((item) => {
    const matchedName = !nameKeyword || item.name.toLowerCase().includes(nameKeyword);
    const matchedCode = !codeKeyword || item.code.toLowerCase().includes(codeKeyword);
    const matchedScope = !params.dataScope || item.dataScope === params.dataScope;

    return matchedName && matchedCode && matchedScope;
  });

  const start = (params.current - 1) * params.size;

  return {
    records: filtered.slice(start, start + params.size),
    current: params.current,
    size: params.size,
    total: filtered.length,
  } satisfies PaginatingQueryRecord<RoleListItem>;
}

export function useRoleListQuery<Data = RoleListItem[]>(options?: RoleListQueryOptions<Data>) {
  return useQuery<RoleListItem[], Error, Data>({
    ...options,
    queryKey: roleKeys.listAll(),
    queryFn: async () => {
      const res = await roleApi.list({ current: 1, size: ROLE_LIST_PAGE_SIZE });
      return res.list;
    },
  });
}

export function useRoleQuery<Data = PaginatingQueryRecord<RoleListItem>>(
  params: RoleSearchParams,
  options?: SemiTableQueryHookOptions<PaginatingQueryRecord<RoleListItem>, Data>,
) {
  return useQuery<RoleListItem[], Error, Data>({
    ...(options as Omit<
      UseQueryOptions<RoleListItem[], Error, Data>,
      "queryFn" | "queryKey" | "select"
    >),
    queryKey: roleKeys.listAll(),
    queryFn: async () => {
      const res = await roleApi.list({ current: 1, size: ROLE_LIST_PAGE_SIZE });
      return res.list;
    },
    select: (list) => {
      const page = buildRolePage(list, params);
      if (options?.select) {
        return options.select(page);
      }
      return page as Data;
    },
  });
}
