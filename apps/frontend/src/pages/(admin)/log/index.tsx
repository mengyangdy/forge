import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/log/")({
  beforeLoad: () => {
    throw redirect({ to: "/log/access" });
  },
  staticData: {
    i18nKey: "route.log",
    menu: {
      icon: "ph:scroll",
      order: 3,
    },
    title: "日志管理",
  },
});
