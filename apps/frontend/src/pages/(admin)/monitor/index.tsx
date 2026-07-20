import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/monitor/")({
  beforeLoad: () => {
    throw redirect({ to: "/monitor/online" });
  },
  staticData: {
    i18nKey: "route.monitor",
    menu: {
      icon: "ph:desktop",
      order: 5,
    },
    title: "系统监控",
  },
});
