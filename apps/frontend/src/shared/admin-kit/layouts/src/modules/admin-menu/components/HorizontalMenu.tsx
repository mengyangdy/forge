import { useSettingsTheme } from "@/shared/admin-theme";
import { Nav } from "@douyinfe/semi-ui";
import { memo } from "react";

import { renderSemiNavItems } from "../../../features/menus/menu-renderer";
import { useAdminMenus } from "../../../state/menus/use-admin-menus";

import { HorizontalMenuMode } from "../enum";

interface Props {
  /** 水平菜单显示模式 */
  mode: HorizontalMenuMode;
}

function stripRootType(menus: Menu.CommonMenu[]): Menu.CommonMenu[] {
  return menus.filter(({ type: _ }) => _ !== "divider").map(({ type: _, ...rest }) => rest);
}

function findChildren(menus: Menu.CommonMenu[], key: string) {
  return menus.find((item) => item.key === key)?.children || [];
}

const HorizontalMenu = memo((props: Props) => {
  const { mode } = props;

  const { header } = useSettingsTheme();

  const {
    activeFirstLevelMenuKey,
    changeActiveFirstLevelMenuKey,
    changeActiveSecondLevelMenuKey,
    firstLevelMenus,
    menus,
    routerPushByKey,
    secondLevelMenus,
    selectedKey,
    setDrawerVisible,
  } = useAdminMenus();

  function getMenus() {
    if (mode === HorizontalMenuMode.All) {
      return menus;
    } else if (mode === HorizontalMenuMode.Child) {
      return secondLevelMenus;
    }
    return firstLevelMenus;
  }

  const allMenus = getMenus();

  const menuItems = renderSemiNavItems(stripRootType(allMenus), { mode: "horizontal" });

  /** 处理菜单点击 - FirstLevel 模式：选择一级菜单，有子级时打开抽屉；其它模式直接跳转 */
  function handleSelect(data: { itemKey?: string | number }) {
    if (data.itemKey == null) return;
    const key = String(data.itemKey);

    if (mode === HorizontalMenuMode.FirstLevel) {
      changeActiveFirstLevelMenuKey(key);

      const children = findChildren(menus, key);

      if (!children.length) {
        routerPushByKey(key);
      } else {
        const child = children[0].children || [];

        if (child.length) {
          changeActiveSecondLevelMenuKey(children[0].key);
          setDrawerVisible(true);
        }
      }
    } else {
      routerPushByKey(key);
    }
  }

  return (
    <Nav
      className="size-full border-0! transition-400"
      items={menuItems}
      mode="horizontal"
      selectedKeys={
        mode === HorizontalMenuMode.FirstLevel ? [activeFirstLevelMenuKey] : selectedKey
      }
      style={{
        lineHeight: `${header.height}px`,
        height: `${header.height}px`,
        background: "transparent",
      }}
      onSelect={handleSelect}
    />
  );
});

export default HorizontalMenu;
