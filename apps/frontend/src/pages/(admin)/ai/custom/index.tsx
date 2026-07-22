import { createFileRoute } from "@tanstack/react-router";

import CustomPage from "./modules/CustomPage";

export const Route = createFileRoute("/(admin)/ai/custom/")({
  component: CustomPage,
  staticData: {
    i18nKey: "route.ai_custom",
    title: "AI自定义",
    menu: {
      icon: "ph:sparkle",
      order: 2,
    },
  },
});
