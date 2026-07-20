import { createFileRoute } from "@tanstack/react-router";

import OnlinePage from "./modules/OnlinePage";

export const Route = createFileRoute("/(admin)/monitor/online/")({
  component: OnlinePage,
  staticData: {
    i18nKey: "route.monitor_online",
    menu: {
      icon: "ph:users-three",
      order: 1,
    },
    title: "在线用户",
  },
});
