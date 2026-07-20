import { createFileRoute } from "@tanstack/react-router";

import DictPage from "./modules/DictPage";

export const Route = createFileRoute("/(admin)/dict/")({
  component: DictPage,
  staticData: {
    i18nKey: "route.dict",
    title: "字典管理",
    menu: {
      icon: "mdi:book-open-variant",
      order: 3,
    },
  },
});
