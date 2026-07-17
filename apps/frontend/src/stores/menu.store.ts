import { create } from "zustand";

import type { GeneratedMenus } from "@/shared/admin-layouts";
import {
  getAdminLayoutsOptions,
  hasRoutePermission,
  menuGenerator,
  normalizePath,
} from "@/shared/admin-layouts";

interface MenuState {
  home: Router.RoutePath;
  menus: GeneratedMenus;
  quickReferenceMenus: Menu.QuickReferenceMenus;
}

interface MenuStore extends MenuState {
  reset: () => void;
  setMenuState: (update: Partial<MenuState>) => void;
}

const EMPTY_MENU_STATE: MenuState = {
  home: "" as Router.RoutePath,
  menus: new Map(),
  quickReferenceMenus: new Map(),
};

function createInitialMenuState(): MenuState {
  return {
    home: getAdminLayoutsOptions().defaultHome,
    menus: new Map(),
    quickReferenceMenus: new Map(),
  };
}

export const useMenuStore = create<MenuStore>((set) => ({
  ...EMPTY_MENU_STATE,
  reset: () => set(createInitialMenuState()),
  setMenuState: (update) => set((state) => ({ ...state, ...update })),
}));

export async function initMenus(userInfo?: Api.Auth.UserInfo | null) {
  const { loadDynamicRoutes, routeMode } = getAdminLayoutsOptions();
  const { setMenuState } = useMenuStore.getState();

  if (routeMode === "dynamic") {
    if (!loadDynamicRoutes) {
      throw new Error(
        "Admin layouts routeMode is dynamic, but loadDynamicRoutes is not configured.",
      );
    }

    const routeData = await loadDynamicRoutes();
    const { allMenus, home, quickReferenceMenus } = menuGenerator.generate({
      backendRoutes: routeData.routes,
      home: routeData.home,
      userInfo,
    });

    setMenuState({ home, menus: allMenus, quickReferenceMenus });
    return;
  }

  const { allMenus, home, quickReferenceMenus } = menuGenerator.generate({ userInfo });
  setMenuState({ home, menus: allMenus, quickReferenceMenus });
}

export function clearMenus() {
  useMenuStore.getState().reset();
}

export function getHomeRoute() {
  return useMenuStore.getState().home;
}

export function getQuickReferenceMenuByPath(path: string) {
  const normalizedPath = normalizePath(path) as Router.RoutePath;
  const { quickReferenceMenus } = useMenuStore.getState();

  for (const quickReferenceMenuMap of quickReferenceMenus.values()) {
    const menu = quickReferenceMenuMap.get(normalizedPath);

    if (menu) {
      return menu;
    }
  }

  return null;
}

export function hasAuthorizedRoutePath(path: string, userInfo?: Api.Auth.UserInfo | null) {
  const { routeMode } = getAdminLayoutsOptions();

  if (routeMode !== "dynamic") {
    return true;
  }

  const menu = getQuickReferenceMenuByPath(path);

  const hasPerm = Boolean(menu && hasRoutePermission(menu, userInfo));

  return hasPerm;
}
