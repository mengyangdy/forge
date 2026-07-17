import { createFileRoute } from "@tanstack/react-router";

import UserPage from "./modules/UserPage";

export const Route = createFileRoute("/(admin)/system/user/")({
  component: UserPage,
  staticData: {
    i18nKey: "route.system_user",
    title: "用户管理",
    menu: {
      icon: "mdi:account-outline",
      order: 1,
    },
  },
});
