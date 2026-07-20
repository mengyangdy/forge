import { useQuery } from "@tanstack/react-query";

import { onlineApi, onlineKeys } from "./api";
import type { OnlineUserSearchParams } from "./types";

export function useOnlineUserListQuery(params?: OnlineUserSearchParams) {
  return useQuery({
    queryFn: () => onlineApi.list(params),
    queryKey: onlineKeys.list(params),
  });
}
