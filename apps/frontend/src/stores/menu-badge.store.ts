import { create } from "zustand";

export type MenuBadgeValues = Record<string, Router.MenuBadgeValue | undefined>;

interface MenuBadgeStore {
  badgeValues: MenuBadgeValues;
  clearMenuBadgeValues: (keys?: string[]) => void;
  setMenuBadgeValue: (key: string, value: Router.MenuBadgeValue | undefined) => void;
  setMenuBadgeValues: (values: MenuBadgeValues) => void;
}

export const useMenuBadgeStore = create<MenuBadgeStore>((set, get) => ({
  badgeValues: {},
  clearMenuBadgeValues: (keys) => {
    if (!keys) {
      set({ badgeValues: {} });
      return;
    }

    const nextValues = { ...get().badgeValues };

    keys.forEach((key) => {
      delete nextValues[key];
    });

    set({ badgeValues: nextValues });
  },
  setMenuBadgeValue: (key, value) =>
    set((state) => ({
      badgeValues: { ...state.badgeValues, [key]: value },
    })),
  setMenuBadgeValues: (values) =>
    set((state) => ({
      badgeValues: { ...state.badgeValues, ...values },
    })),
}));
