import { useQuery } from "@tanstack/react-query";

import { jobApi, jobKeys } from "./api";
import type { JobListSearchParams } from "./types";

export function useQueuesOverviewQuery() {
  return useQuery({
    queryFn: () => jobApi.queues(),
    queryKey: jobKeys.queues(),
    refetchInterval: 5000,
  });
}

export function useJobListQuery(params: JobListSearchParams) {
  return useQuery({
    enabled: Boolean(params.queue && params.status),
    queryFn: () => jobApi.list(params),
    queryKey: jobKeys.list(params),
  });
}

export function useJobDetailQuery(queue: string, jobId: string) {
  return useQuery({
    enabled: Boolean(queue && jobId),
    queryFn: () => jobApi.detail(queue, jobId),
    queryKey: jobKeys.detail(queue, jobId),
  });
}
