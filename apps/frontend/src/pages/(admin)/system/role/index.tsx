import { createFileRoute } from "@tanstack/react-router";

import RolePage from "./modules/RolePage";

export const Route = createFileRoute("/(admin)/system/role/")({
  component: RolePage,
  staticData: {
    i18nKey: "route.system_role",
    title: "角色管理",
    menu: {
      icon: "mdi:shield-account-outline",
      order: 2,
    },
  },
});
