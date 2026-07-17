import type { PermissionType } from "@/service/api/permission";

export const TYPE_OPTIONS: { label: string; value: PermissionType }[] = [
  { label: "目录", value: "catalogue" },
  { label: "菜单", value: "menu" },
];

export const TYPE_COLOR: Record<PermissionType, string> = {
  menu: "blue",
  button: "green",
  catalogue: "purple",
};

export const TYPE_LABEL: Record<PermissionType, string> = {
  menu: "菜单",
  button: "按钮",
  catalogue: "目录",
};

export const MENU_TABLE_SCROLL_X = 960;
