import { createFileRoute } from "@tanstack/react-router";

import ChatPage from "./modules/ChatPage";

export const Route = createFileRoute("/(admin)/ai/chat/")({
  component: ChatPage,
  staticData: {
    i18nKey: "route.ai_chat",
    menu: {
      icon: "ph:shield-check",
      order: 1,
    },
    title: "AI对话",
  },
});
