import { createFileRoute } from "@tanstack/react-router";

import DeptPage from "./modules/DeptPage";

export const Route = createFileRoute("/(admin)/system/dept/")({
  component: DeptPage,
  staticData: {
    i18nKey: "route.system_dept",
    title: "部门管理",
    menu: {
      icon: "mdi:office-building-outline",
      order: 3,
    },
  },
});
