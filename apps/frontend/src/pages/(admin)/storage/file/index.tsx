import { createFileRoute } from "@tanstack/react-router";

import FilePage from "./modules/FilePage";

export const Route = createFileRoute("/(admin)/storage/file/")({
  component: FilePage,
  staticData: {
    i18nKey: "route.storage_file",
    menu: {
      icon: "ph:files",
      order: 1,
    },
    title: "文件管理",
  },
});
