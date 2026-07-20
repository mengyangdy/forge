import { AdminLayout as WebAdminLayout } from "@/shared/admin-layouts";
import { NotificationButton } from "@/shared/admin-notification";
import DarkModeContainer from "@/shared/ui/compose/components/DarkModeContainer";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { SystemLogo, UserAvatar } from "@/components";
import { guardAdminRoute } from "@/features/router/guard";
import type { AdminRouteGuardOptions, AdminRouteGuardResult } from "@/features/router/guard";
import { useAllDictsQuery } from "@/service/api/dict/hooks";

const AdminFooter = () => {
  return (
    <DarkModeContainer className="h-full flex-center">
      <a
        href="https://github.com/Ohh-889/forge-admin/blob/main/LICENSE"
        rel="noopener noreferrer"
        target="_blank"
      >
        Copyright MIT © 2021 Forge
      </a>
    </DarkModeContainer>
  );
};

const AdminLayout = () => {
  const { t } = useTranslation();
  useAllDictsQuery(); // 预加载并全局缓存所有数据字典项

  return (
    <WebAdminLayout
      footer={<AdminFooter />}
      headerMiddleActions={<NotificationButton className="px-12px" />}
      headerRightActions={<UserAvatar />}
      logo={<SystemLogo className="w-56px text-32px text-primary" />}
      logoTitle={t("system.title")}
    />
  );
};

function beforeLoadAdminRoute(options: AdminRouteGuardOptions): AdminRouteGuardResult {
  return guardAdminRoute(options);
}

export const Route = createFileRoute("/(admin)")({
  component: AdminLayout,
  // TanStack Router 的 beforeLoad 上下文类型与 AdminRouteGuardOptions 结构在运行时完全兼容，
  // 但两者的泛型签名无法自动对齐（RouterContext vs AdminRouteGuardContext 字段不完全重叠）。
  // 这里用 as any 是社区惯用做法，等 TanStack Router 完善 beforeLoad 类型推导后可移除。
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  beforeLoad: beforeLoadAdminRoute as any,
});
