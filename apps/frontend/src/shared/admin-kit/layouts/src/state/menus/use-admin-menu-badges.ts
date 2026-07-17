import { type MenuBadgeValues, useMenuBadgeStore } from "@/stores/menu-badge.store";

export type { MenuBadgeValues };

export function setMenuBadgeValue(key: string, value: Router.MenuBadgeValue | undefined) {
  useMenuBadgeStore.getState().setMenuBadgeValue(key, value);
}

export function setMenuBadgeValues(values: MenuBadgeValues) {
  useMenuBadgeStore.getState().setMenuBadgeValues(values);
}

export function clearMenuBadgeValues(keys?: string[]) {
  useMenuBadgeStore.getState().clearMenuBadgeValues(keys);
}

export function useAdminMenuBadges() {
  const badgeValues = useMenuBadgeStore((state) => state.badgeValues);

  return {
    badgeValues,
    clearMenuBadgeValues,
    setMenuBadgeValue,
    setMenuBadgeValues,
  };
}
