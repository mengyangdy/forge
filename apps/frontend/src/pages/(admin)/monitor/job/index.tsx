import { createFileRoute } from "@tanstack/react-router";

import JobPage from "./modules/JobPage";

export const Route = createFileRoute("/(admin)/monitor/job/")({
  component: JobPage,
  staticData: {
    i18nKey: "route.monitor_job",
    menu: {
      icon: "ph:timer",
      order: 2,
    },
    title: "定时任务",
  },
});
