import {
  clearMenus,
  getHomeRoute,
  getQuickReferenceMenuByPath,
  hasAuthorizedRoutePath,
  initMenus,
  useMenuStore,
} from "@/stores/menu.store";

export { clearMenus, getHomeRoute, getQuickReferenceMenuByPath, hasAuthorizedRoutePath, initMenus };

export const useMenus = () => {
  const home = useMenuStore((state) => state.home);
  const menus = useMenuStore((state) => state.menus);
  const quickReferenceMenus = useMenuStore((state) => state.quickReferenceMenus);

  return {
    home,
    menus,
    quickReferenceMenus,
    initMenus,
    clearMenus,
    getHomeRoute,
  };
};
