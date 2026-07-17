import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

type MutationCacheConfig = ConstructorParameters<typeof MutationCache>[0];
type QueryCacheConfig = ConstructorParameters<typeof QueryCache>[0];

interface CreateQueryClientOptions {
  /** 覆盖默认 defaultOptions（会与内置默认值浅合并） */
  defaultOptions?: import("@tanstack/react-query").DefaultOptions;
  /** MutationCache 配置（onError / onSuccess / onSettled / onMutate） */
  mutationCache?: MutationCacheConfig;
  /** QueryCache 配置（onError / onSuccess / onSettled） */
  queryCache?: QueryCacheConfig;
}

/** 创建平台无关的 QueryClient 实例 */
function createQueryClient(options: CreateQueryClientOptions = {}) {
  const { defaultOptions, mutationCache, queryCache } = options;

  return new QueryClient({
    defaultOptions: {
      mutations: {
        gcTime: 60 * 1000,
        networkMode: "online",
        retry: 1,
        throwOnError: false,
        ...defaultOptions?.mutations,
      },
      queries: {
        gcTime: 10 * 60 * 1000,
        networkMode: "online",
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        retry: 2,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        retryOnMount: true,
        staleTime: 30 * 1000,
        throwOnError: false,
        ...defaultOptions?.queries,
      },
    },
    mutationCache: new MutationCache(mutationCache),
    queryCache: new QueryCache(queryCache),
  });
}

function handleError(error: unknown) {
  if (import.meta.env.DEV) {
    // oxlint-disable-next-line no-console
    console.error("Query/Mutation error:", error);
  }
}

export const queryClient = createQueryClient({
  mutationCache: { onError: handleError },
  queryCache: { onError: handleError },
});
