/**
 * User Query Hooks
 *
 * 为 useTable 提供 queryHook，遵循项目约定：
 * - 自行声明 queryKey（含 params，参数变化自动重查）
 * - 自行声明 queryFn
 * - 必须展开 options（让 useTable 接管 enabled/select）
 */

import { useQuery } from "@tanstack/react-query";
import type { SemiTableQueryHookOptions } from "@/shared/web-ui-compose";
import type { PaginatingQueryRecord } from "@/shared/web-ui-compose";

import { userApi } from "./api";
import type { UserListItem, UserSearchParams } from "./types";

/**
 * 用户列表查询 Hook。
 *
 * 后端返回 `{ list, total }`，这里转换为 useTable 期望的
 * `{ records, current, size, total }` 结构，让默认 transformer 能工作。
 */
export function useUserQuery<Data = PaginatingQueryRecord<UserListItem>>(
  params: UserSearchParams,
  options?: SemiTableQueryHookOptions<PaginatingQueryRecord<UserListItem>, Data>,
) {
  return useQuery<PaginatingQueryRecord<UserListItem>, Error, Data>({
    ...options,
    queryKey: ["user", "list", params],
    queryFn: async () => {
      const res = await userApi.list(params);

      return {
        records: res.list,
        current: params.current,
        size: params.size,
        total: res.total,
      } satisfies PaginatingQueryRecord<UserListItem>;
    },
  });
}
