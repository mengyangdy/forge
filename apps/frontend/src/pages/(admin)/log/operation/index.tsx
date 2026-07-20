import { createFileRoute } from "@tanstack/react-router";

import OperationLogPage from "./modules/OperationLogPage";

export const Route = createFileRoute("/(admin)/log/operation/")({
  component: OperationLogPage,
  staticData: {
    i18nKey: "route.log_operation",
    menu: {
      icon: "ph:clipboard-text",
      order: 2,
    },
    title: "操作日志",
  },
});
