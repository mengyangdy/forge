import type { SetupAppVersionNotificationOptions } from "@/shared/admin-runtime";
import { Button } from "@douyinfe/semi-ui";

import { destroyNotification, globalConfig, showNotification } from "@/config";
import { router } from "@/features/router";

import { $t } from "../locales";

const UPDATE_NOTIFICATION_KEY = "update-notification";

export function createAdminAppVersionNotificationPluginOptions(): SetupAppVersionNotificationOptions {
  return {
    baseUrl: import.meta.env.VITE_BASE_URL || "/",
    currentBuildTime: BUILD_TIME,
    enabled: globalConfig.automaticallyDetectUpdate && import.meta.env.PROD,
    onError(error) {
      // oxlint-disable-next-line no-console
      console.error("Failed to get HTML build time:", error);
    },
    onUpdateAvailable({ markPromptClosed }) {
      const handleCancel = () => {
        destroyNotification(UPDATE_NOTIFICATION_KEY);
        markPromptClosed();
      };

      const handleOk = () => {
        void router.navigate({ to: "." });
      };

      showNotification({
        actions: (
          <div className="w-325px flex justify-end gap-3">
            <Button key="cancel" theme="borderless" type="tertiary" onClick={handleCancel}>
              {$t("system.updateCancel")}
            </Button>
            <Button key="ok" theme="solid" type="primary" onClick={handleOk}>
              {$t("system.updateConfirm")}
            </Button>
          </div>
        ),
        description: $t("system.updateContent"),
        key: UPDATE_NOTIFICATION_KEY,
        onClose: markPromptClosed,
        title: $t("system.updateTitle"),
      });
    },
  };
}
