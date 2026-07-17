import { cacheTabs, useMenus } from "@/shared/admin-layouts";

import { useUserInfoQuery } from "@/service/api";
import { queryClient } from "@/service/queryClient";
import { clearAuthStorage, setAuth, useAuthStore } from "@/stores/auth.store";
import { localStg } from "@/utils/storage";

export { clearAuthStorage, getToken, setAuth } from "@/stores/auth.store";

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const initialized = useAuthStore((state) => state.initialized);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  const { clearMenus, getHomeRoute, home, initMenus } = useMenus();
  const isLoggedIn = Boolean(token);
  const { data: userInfo, refetch } = useUserInfoQuery();

  async function initAuth() {
    try {
      const { data } = await refetch();

      if (!data) {
        return null;
      }

      await initMenus(data);
      setInitialized(true);

      return data;
    } catch (error) {
      if (import.meta.env.DEV) {
        // oxlint-disable-next-line no-console
        console.warn("[useAuth] initAuth 失败（可能是网络故障或服务异常，非未登录）:", error);
      }
      return null;
    }
  }

  function handleClearAuth() {
    if (userInfo) {
      localStg.set("lastLoginUserId", userInfo.userId);
    }

    queryClient.clear();

    setToken(null);
    setInitialized(false);

    clearAuthStorage();
    clearMenus();
    cacheTabs();
  }

  function handleSetAuth(data: Api.Auth.LoginToken) {
    setToken(data.token);
    setAuth(data);
  }

  return {
    token,
    userInfo: userInfo || undefined,
    isLoggedIn,
    clearAuth: handleClearAuth,
    getHomeRoute,
    homeRoute: home,
    initMenus,
    initAuth,
    isAuthInitialized: initialized,
    setAuth: handleSetAuth,
  };
}
