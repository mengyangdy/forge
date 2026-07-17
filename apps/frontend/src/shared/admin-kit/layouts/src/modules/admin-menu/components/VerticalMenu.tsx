/* eslint-disable react-hooks/exhaustive-deps */
import { useSettingsTheme } from "@/shared/admin-theme";
import ScrollArea from "@/shared/ui/primitives/preset/scroll-area/ScrollArea";
import { Nav } from "@douyinfe/semi-ui";
import { useUpdateEffect } from "ahooks";
import { clsx } from "clsx";
import { memo, useEffect, useState } from "react";

import {
  FIRST_LEVEL_LAYOUT_MODES,
  LAYOUT_MODE_TOP_HYBRID_HEADER_FIRST,
  LAYOUT_MODE_VERTICAL,
  LAYOUT_MODE_VERTICAL_MIX,
} from "../../../constant";
import { renderSemiNavItems } from "../../../features/menus/menu-renderer";
import { useAdminMenus } from "../../../state/menus/use-admin-menus";
import { useAdminState } from "../../../state/use-admin-state";

const VerticalMenu = memo(() => {
  const {
    childLevelMenus,
    menus: allMenus,
    openKeys,
    route,
    routerPushByKey,
    secondLevelMenus,
    selectedKey,
  } = useAdminMenus();

  const { siderCollapse, verticalMenuWidth } = useAdminState();

  const {
    darkMode,
    layout: { mode },
    sider,
  } = useSettingsTheme();

  const isTopHybridHeaderFirst = mode === LAYOUT_MODE_TOP_HYBRID_HEADER_FIRST;

  const isVertical = mode === LAYOUT_MODE_VERTICAL;

  const inlineCollapsed = isVertical || isTopHybridHeaderFirst ? siderCollapse : false;

  const isVerticalMix = mode === LAYOUT_MODE_VERTICAL_MIX;

  const isMix = FIRST_LEVEL_LAYOUT_MODES.includes(mode);

  const [stateOpenKeys, setStateOpenKeys] = useState<string[]>(inlineCollapsed ? [] : openKeys);

  /** 浅色模式下 sider 反色：用 Semi 局部 dark 类 */
  const darkTheme = !darkMode && sider.inverted;

  const scrollbarClass = "z-10 w-7px bg-transparent p-0";

  const scrollbarThumbClass =
    "rounded-10px bg-[rgba(144,147,153,0.3)] hover:bg-[rgba(144,147,153,0.3)]";

  let menus = allMenus;

  if (isVerticalMix) {
    menus = secondLevelMenus;
  } else if (isMix) {
    menus = isTopHybridHeaderFirst ? secondLevelMenus : childLevelMenus;
  }

  const menuItems = renderSemiNavItems(menus, { mode: "vertical" });

  function handleSelect(data: { itemKey?: string | number }) {
    if (data.itemKey == null) return;
    routerPushByKey(String(data.itemKey));
  }

  function handleOpenChange(data: { openKeys?: Array<string | number> }) {
    const keys = (data.openKeys ?? []).map(String);
    setStateOpenKeys(keys);
  }

  useEffect(() => {
    if (inlineCollapsed) return;
    setStateOpenKeys(openKeys);
  }, [route.pathname, inlineCollapsed]);

  useUpdateEffect(() => {
    if (inlineCollapsed) {
      setStateOpenKeys([]);
    } else {
      setStateOpenKeys(openKeys);
    }
  }, [inlineCollapsed]);

  return (
    <ScrollArea
      className="h-full"
      classNames={{
        scrollbar: scrollbarClass,
        thumb: scrollbarThumbClass,
      }}
      orientation="vertical"
      size="xs"
      type="scroll"
    >
      <Nav
        className={clsx("h-full border-0! transition-300", {
          "bg-container!": !darkTheme,
          "semi-always-dark": darkTheme,
        })}
        isCollapsed={inlineCollapsed}
        items={menuItems}
        limitIndent={false}
        mode="vertical"
        openKeys={stateOpenKeys}
        selectedKeys={selectedKey}
        style={{ width: verticalMenuWidth, height: "100%", background: "transparent" }}
        onOpenChange={handleOpenChange}
        onSelect={handleSelect}
      />
    </ScrollArea>
  );
});

export default VerticalMenu;
