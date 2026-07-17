import type { AdminDevtoolsProps } from "@/shared/admin-devtools";
import { NotificationProvider } from "@/shared/admin-notification";
import { useSettingsTheme } from "@/shared/admin-theme";
import LazyAnimate from "@/shared/ui/compose/components/LazyAnimate";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useMemo } from "react";
import type { ReactNode } from "react";

import wechatStyleNotification from "./assets/audio/wechat-style-notification.wav";
import { globalConfig } from "./config";
import GlobalEffect from "./features/effects/GlobalEffect";
import { router } from "./features/router";
import RouterProvider from "./features/router/RouterProvider";
import AppSemiProvider from "./features/semi/AppSemiProvider";
import { queryClient } from "./service/queryClient";

interface ProviderProps {
  /** 需要挂载到全局 Provider 下的应用内容。 */
  children: ReactNode;
}

// 开发环境才加载 Devtools，生产环境会被 tree-shaking 移除
const AdminDevtools = import.meta.env.DEV
  ? lazy(() => import("@/shared/admin-devtools").then((mod) => ({ default: mod.AdminDevtools })))
  : (_props: AdminDevtoolsProps) => null;

const Devtools = () => {
  const { darkMode } = useSettingsTheme();

  const config = useMemo<AdminDevtoolsProps["config"]>(() => {
    return {
      ...globalConfig.devtools,
      theme: darkMode ? "dark" : "light",
    };
  }, [darkMode]);

  return (
    <Suspense fallback={null}>
      <AdminDevtools config={config} queryClient={queryClient} router={router} />
    </Suspense>
  );
};

const Provider = (props: ProviderProps) => {
  const { children } = props;

  return (
    <QueryClientProvider client={queryClient}>
      <Devtools />
      {children}
    </QueryClientProvider>
  );
};

const App = () => (
  <Provider>
    <AppSemiProvider>
      <NotificationProvider soundUrl={wechatStyleNotification}>
        <LazyAnimate>
          <RouterProvider />
          <GlobalEffect />
        </LazyAnimate>
      </NotificationProvider>
    </AppSemiProvider>
  </Provider>
);

export default App;
