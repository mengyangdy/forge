import { Outlet, createFileRoute } from "@tanstack/react-router";

const SystemLayout = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/(admin)/system")({
  component: SystemLayout,
  staticData: {
    i18nKey: "route.system",
    title: "系统管理",
    menu: {
      icon: "mdi:cog-outline",
      order: 2,
    },
  },
});
