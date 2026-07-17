import type { RoleDataScope } from "@/service/api/role";

export const DATA_SCOPE_OPTIONS: { label: string; value: RoleDataScope }[] = [
  { label: "全部数据", value: "all" },
  { label: "本部门及下级", value: "dept_child" },
  { label: "本部门", value: "dept" },
  { label: "仅本人", value: "self" },
  { label: "自定义", value: "custom" },
];

export const DATA_SCOPE_LABEL: Record<RoleDataScope, string> = {
  all: "全部数据",
  dept_child: "本部门及下级",
  dept: "本部门",
  self: "仅本人",
  custom: "自定义",
};

export const ROLE_TABLE_SCROLL_X = 1020;
