import { useQuery } from "@tanstack/react-query";
import type { PaginatingQueryRecord, SemiTableQueryHookOptions } from "@/shared/web-ui-compose";

import { getAccessLogList, getOperationLogList } from "./api";
import type {
  AccessLogItem,
  AccessLogSearchParams,
  OperationLogItem,
  OperationLogSearchParams,
} from "./types";

export function useAccessLogQuery<Data = PaginatingQueryRecord<AccessLogItem>>(
  params: AccessLogSearchParams,
  options?: SemiTableQueryHookOptions<PaginatingQueryRecord<AccessLogItem>, Data>,
) {
  return useQuery<PaginatingQueryRecord<AccessLogItem>, Error, Data>({
    ...options,
    queryKey: ["system-log", "access", params],
    queryFn: () => getAccessLogList(params),
  });
}

export function useOperationLogQuery<Data = PaginatingQueryRecord<OperationLogItem>>(
  params: OperationLogSearchParams,
  options?: SemiTableQueryHookOptions<PaginatingQueryRecord<OperationLogItem>, Data>,
) {
  return useQuery<PaginatingQueryRecord<OperationLogItem>, Error, Data>({
    ...options,
    queryKey: ["system-log", "operation", params],
    queryFn: () => getOperationLogList(params),
  });
}
