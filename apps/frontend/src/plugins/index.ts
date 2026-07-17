import { setupAdminRuntimePlugins } from "@/shared/admin-runtime";
import type { SetupIconifyOfflineOptions, SetupNProgressOptions } from "@/shared/admin-runtime";

import { initNProgress } from "@/config";

import { createAdminAppVersionNotificationPluginOptions } from "./app";

export * from "./app";

const adminIconifyOfflinePluginOptions = {
  apiUrl: import.meta.env.VITE_ICONIFY_URL,
} satisfies SetupIconifyOfflineOptions;

const adminNProgressPluginOptions = {
  easing: "ease",
  onReady: initNProgress,
  parent: ".root",
  speed: 500,
} satisfies SetupNProgressOptions;

export function setupAdminPlugins() {
  return setupAdminRuntimePlugins({
    appVersionNotification: createAdminAppVersionNotificationPluginOptions(),
    iconifyOffline: adminIconifyOfflinePluginOptions,
    nprogress: adminNProgressPluginOptions,
  });
}
