import { createFileRoute } from "@tanstack/react-router";

import AccessLogPage from "./modules/AccessLogPage";

export const Route = createFileRoute("/(admin)/log/access/")({
  component: AccessLogPage,
  staticData: {
    i18nKey: "route.log_access",
    menu: {
      icon: "ph:shield-check",
      order: 1,
    },
    title: "访问日志",
  },
});
