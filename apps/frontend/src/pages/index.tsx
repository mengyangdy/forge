import { createFileRoute, redirect } from "@tanstack/react-router";

import { getToken } from "@/features/auth/use-auth";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (context.isLoggedIn && getToken()) {
      throw redirect({ to: context.getHomeRoute() });
    }

    throw redirect({ to: "/login" });
  },
  staticData: {
    title: "ForgeAdmin",
  },
});
