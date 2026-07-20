import { memo } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Button, Dropdown } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";

import { showSemiConfirmModal } from "@/shared/admin-theme";
import SvgIcon from "@/shared/ui/compose/components/SvgIcon";

import { useUserInfoQuery } from "@/service/api";

import { useAuth } from "@/features/auth/use-auth";

const UserAvatar = () => {
  const { isLoggedIn } = useAuth();

  const { data: userInfo } = useUserInfoQuery();

  const { t } = useTranslation();

  const navigate = useNavigate();

  const location = useLocation();

  const fullPath = location.pathname + (location.searchStr || "");

  function logout() {
    showSemiConfirmModal({
      cancelText: t("common.cancel"),
      content: t("common.logoutConfirm"),
      okText: t("common.confirm"),
      onOk: () => {
        void navigate({ to: "/login-out", search: { redirect: fullPath } });
      },
      title: t("common.tip"),
    });
  }

  function loginOrRegister() {
    void navigate({ to: "/login" });
  }

  if (isLoggedIn) {
    return (
      <Dropdown
        clickToHide
        menu={[
          {
            node: "item",
            name: t("common.logout"),
            icon: <SvgIcon className="text-lg" icon="ph:sign-out" />,
            onClick: logout,
          },
        ]}
        position="bottomRight"
        trigger="click"
      >
        <button className="h-full flex-center gap-8px border-none bg-transparent px-12px cursor-pointer">
          <SvgIcon className="text-2xl" icon="ph:user-circle" />
          <span className="text-md font-medium">{userInfo?.username}</span>
        </button>
      </Dropdown>
    );
  }

  return (
    <Button theme="light" onClick={loginOrRegister}>
      {t("page.login.common.loginOrRegister")}
    </Button>
  );
};

export default memo(UserAvatar);
