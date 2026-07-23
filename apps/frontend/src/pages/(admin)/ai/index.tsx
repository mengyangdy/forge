import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/ai/")({
  beforeLoad: () => {
    throw redirect({ to: "/ai/custom" });
  },
  staticData: {
    i18nKey: "route.ai",
    menu: {
      icon: "ph:robot",
      order: 3,
    },
    title: "AI管理",
  },
});
