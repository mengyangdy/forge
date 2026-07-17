/**
 * Query Options 工厂函数
 *
 * 用于创建标准化的 Query Options，避免重复配置
 */

import { queryOptions } from "@tanstack/react-query";
import { defaultQueryConfig } from "./config";

/**
 * 创建 Query Options（带默认配置）
 *
 * @example
 * export const userOptions = {
 *   list: () => createQueryOptions({
 *     queryKey: userKeys.list(),
 *     queryFn: userApi.list,
 *   }),
 * };
 */
export function createQueryOptions<T, TKey extends readonly unknown[]>(config: {
  queryKey: TKey;
  queryFn: () => Promise<T>;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
  retry?: number | boolean;
  refetchOnWindowFocus?: boolean;
}) {
  return queryOptions<T, TKey>({
    ...defaultQueryConfig,
    ...config,
  });
}
