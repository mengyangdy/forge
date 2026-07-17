import { useLoading } from "@/shared/hooks";
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { showErrorMessage, showSuccessNotification } from "@/shared/admin-theme";

import { useLoginMutation } from "@/service/api";
import { localStg } from "@/utils/storage";

import { useAuth } from "./use-auth";

export function useInitLogin() {
  const { endLoading, loading, startLoading } = useLoading();

  const search = useSearch({ strict: false });

  const { t } = useTranslation();

  const { initAuth, setAuth } = useAuth();

  const navigate = useNavigate();
  const router = useRouter();

  const { mutateAsync: toLogin } = useLoginMutation();

  async function login(params: Api.Auth.LoginParams, redirect = true) {
    if (loading) return;

    startLoading();

    try {
      // 1. 登录
      const data = await toLogin(params);

      // 2. 存储 Token
      setAuth(data as Api.Auth.LoginToken);

      // 3. 获取用户信息
      const info = await initAuth();

      if (info) {
        // 4. 刷新路由
        await router.invalidate();

        // 5. 处理跳转逻辑
        const lastLoginUserId = localStg.get("lastLoginUserId");

        let needRedirect = redirect;

        if (!lastLoginUserId || lastLoginUserId !== info.userId) {
          needRedirect = false;

          localStg.remove("globalTabs");
          localStg.remove("lastLoginUserId");
        }

        // 6. 跳转页面
        if (needRedirect) {
          await navigate({ to: search.redirect || "/", replace: true });
        } else {
          await navigate({ to: "/", replace: true });
        }

        // 7. 显示成功提示
        showSuccessNotification({
          description: t("page.login.common.welcomeBack", { userName: info.username }),
          title: t("page.login.common.loginSuccess"),
        });
      }
    } catch (error) {
      // 失败处理
      if (import.meta.env.DEV) {
        // oxlint-disable-next-line no-console
        console.error("登录失败:", error);
      }
      showErrorMessage(t("page.login.common.loginFailed"));
    } finally {
      // 无论成功失败，结束 loading
      endLoading();
    }
  }

  return {
    login,
    loading,
  };
}
