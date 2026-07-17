import type { DeptStatus } from "@/service/api/department";

export const STATUS_OPTIONS: { label: string; value: DeptStatus }[] = [
  { label: "启用", value: "active" },
  { label: "停用", value: "disabled" },
];
