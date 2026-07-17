import I18nLabel from "@/shared/ui/compose/components/I18nLabel";
import SvgIcon from "@/shared/ui/compose/components/SvgIcon";
import BeyondHiding from "@/shared/ui/semi/components/BeyondHiding";
import type { ReactNode } from "react";
import { createElement } from "react";

import { getAdminLayoutsOptions } from "../../setup";
import type { GeneratedMenu } from "./menu-generator";
import MenuBadge from "./MenuBadge";

function createMenuTitle(menu: GeneratedMenu) {
  return <I18nLabel fallback={menu.title} i18nKey={menu.i18nKey} />;
}

function createMenuExtra(menu: GeneratedMenu) {
  const badge = menu.badge ? <MenuBadge badge={menu.badge} /> : null;
  const extra = createCustomMenuExtra(menu);

  if (badge && extra) {
    return (
      <span className="inline-flex items-center gap-6px">
        {badge}
        {extra}
      </span>
    );
  }

  return badge ?? extra;
}

function createCustomMenuExtra(menu: GeneratedMenu) {
  if (!menu.extra) return undefined;

  const { extras } = getAdminLayoutsOptions();
  const Extra = extras?.[menu.extra];

  if (!Extra) return undefined;

  return createElement(Extra, menu);
}

function renderMenu(menu: GeneratedMenu): Menu.CommonMenu {
  if (menu.type === "divider") {
    return {
      key: menu.key,
      label: null,
      order: menu.order,
      title: menu.title,
      type: "divider",
    };
  }

  const title = createMenuTitle(menu);
  const { defaultIcon } = getAdminLayoutsOptions();
  const commonMenu: Menu.CommonMenu = {
    extra: createMenuExtra(menu),
    i18nKey: menu.i18nKey,
    icon: (
      <SvgIcon
        icon={menu.icon || defaultIcon}
        localIcon={menu.localIcon}
        style={{ fontSize: "20px" }}
      />
    ),
    key: menu.key,
    label: <BeyondHiding title={title} />,
    order: menu.order,
    title: menu.title,
    type: menu.type,
  };

  if (menu.children?.length) {
    commonMenu.children = renderCommonMenus(menu.children);
  }

  return commonMenu;
}

function createSubMenuLabel(label: ReactNode, extra: ReactNode) {
  return (
    <span
      className="box-border flex-y-center min-w-0 w-full justify-between gap-8px pr-28px"
      data-menu-submenu-label="with-extra"
    >
      <span className="min-w-0 flex-1 overflow-hidden">{label}</span>
      <span className="inline-flex shrink-0 items-center">{extra}</span>
    </span>
  );
}

function createHorizontalMenuLabel(label: ReactNode, extra: ReactNode) {
  return (
    <span
      className="inline-flex max-w-full min-w-0 items-center gap-6px"
      data-menu-horizontal-label="with-extra"
    >
      <span className="min-w-0 overflow-hidden">{label}</span>
      <span className="inline-flex shrink-0 items-center">{extra}</span>
    </span>
  );
}

function createMenuItemLabel(
  label: ReactNode,
  extra: ReactNode | undefined,
  isHorizontalRootMenu: boolean,
) {
  if (!extra) {
    return label;
  }

  if (isHorizontalRootMenu) {
    return createHorizontalMenuLabel(label, extra);
  }

  return createSubMenuLabel(label, extra);
}

export function renderCommonMenus(menus: GeneratedMenu[]) {
  return menus.map(renderMenu);
}

type SemiNavItem = {
  itemKey: string;
  text: ReactNode;
  icon?: ReactNode;
  items?: SemiNavItem[];
};

interface RenderSemiNavItemsOptions {
  /** 横向菜单根级与侧边菜单的 extra 布局略有差异 */
  mode?: "horizontal" | "vertical";
}

function createSemiNavItem(
  menu: Menu.CommonMenu,
  options: RenderSemiNavItemsOptions = {},
  level = 0,
): SemiNavItem | null {
  if (menu.type === "divider") {
    return null;
  }

  const isHorizontalRootMenu = options.mode === "horizontal" && level === 0;
  const text = createMenuItemLabel(menu.label, menu.extra, isHorizontalRootMenu);

  if (menu.children?.length) {
    const items = menu.children
      .map((child) => createSemiNavItem(child, options, level + 1))
      .filter((item): item is SemiNavItem => item !== null);

    return {
      itemKey: menu.key,
      text,
      icon: menu.icon,
      items,
    };
  }

  return {
    itemKey: menu.key,
    text:
      menu.extra && isHorizontalRootMenu ? createHorizontalMenuLabel(menu.label, menu.extra) : text,
    icon: menu.icon,
  };
}

/** 将 CommonMenu 转为 Semi Nav `items`（P1 导航迁移）。 */
export function renderSemiNavItems(
  menus: Menu.CommonMenu[],
  options: RenderSemiNavItemsOptions = {},
): SemiNavItem[] {
  return menus
    .map((menu) => createSemiNavItem(menu, options))
    .filter((item): item is SemiNavItem => item !== null);
}
