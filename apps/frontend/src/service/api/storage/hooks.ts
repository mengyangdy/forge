import { useQuery } from "@tanstack/react-query";

import { storageApi, storageKeys } from "./api";
import type { StorageSearchParams } from "./types";

export function useFileListQuery(params?: StorageSearchParams) {
  return useQuery({
    queryFn: () => storageApi.list(params),
    queryKey: storageKeys.list(params),
  });
}

export function useStorageConfigQuery() {
  return useQuery({
    queryFn: () => storageApi.getConfig(),
    queryKey: storageKeys.config,
  });
}
