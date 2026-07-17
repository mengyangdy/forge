import { createFileRoute } from "@tanstack/react-router";

import MenuPage from "./modules/MenuPage";

export const Route = createFileRoute("/(admin)/system/menu/")({
  component: MenuPage,
  staticData: {
    i18nKey: "route.system_menu",
    title: "菜单管理",
    menu: {
      icon: "mdi:format-list-bulleted",
      order: 4,
    },
  },
});
