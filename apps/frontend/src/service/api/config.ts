/**
 * API 默认配置
 */

/**
 * 查询默认配置（TanStack Query）
 */
export const defaultQueryConfig = {
  staleTime: 5 * 60 * 1000, // 5 分钟内数据新鲜，不发请求
  gcTime: 30 * 60 * 1000, // 30 分钟后清除缓存
  retry: 2, // 失败重试 2 次
  refetchOnWindowFocus: false, // 窗口聚焦不刷新
} as const;

/**
 * Mutation 默认配置
 */
export const defaultMutationConfig = {
  retry: 1, // 失败重试 1 次
} as const;
