import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/storage/")({
  beforeLoad: () => {
    throw redirect({ to: "/storage/file" });
  },
  staticData: {
    i18nKey: "route.storage",
    menu: {
      icon: "ph:hard-drives",
      order: 6,
    },
    title: "存储管理",
  },
});
