import { SvgIcon } from "@/shared/ui/compose";
import { Dropdown } from "@douyinfe/semi-ui";
import type { DropDownMenuItem } from "@douyinfe/semi-ui/lib/es/dropdown";
import { useTranslation } from "react-i18next";

import { useAdminTab } from "../../../state/tabs/use-admin-tab";

interface TabContextMenuProps {
  /** 右键菜单触发区域。 */
  children: React.ReactNode;
  /** 当前场景禁用的菜单项。 */
  disabledKeys?: App.Global.DropdownKey[];
  /** 当前操作的标签页。 */
  tab: App.Global.Tab;
}

export const TabContextMenu = (props: TabContextMenuProps) => {
  const { children, disabledKeys = [], tab } = props;

  const { t } = useTranslation();

  const { clearLeftTabs, clearRightTabs, clearTabs, fixTab, homeTab, removeTab, unfixTab } =
    useAdminTab();

  const { id: tabId } = tab;

  const isHomeTab = tabId === homeTab?.id;

  const isFixed = tab.fixedIndex !== undefined && tab.fixedIndex !== null;

  const menu: DropDownMenuItem[] = [
    {
      node: "item",
      name: t("dropdown.closeCurrent"),
      disabled: disabledKeys.includes("closeCurrent"),
      icon: <SvgIcon className="text-icon" icon="mdi:close" />,
      onClick: () => {
        void removeTab(tabId);
      },
    },
    {
      node: "item",
      name: t("dropdown.closeOther"),
      icon: <SvgIcon className="text-icon" icon="mdi:close-box-multiple-outline" />,
      onClick: () => {
        void clearTabs([tabId]);
      },
    },
    {
      node: "item",
      name: t("dropdown.closeLeft"),
      disabled: disabledKeys.includes("closeLeft"),
      icon: <SvgIcon className="text-icon" icon="mdi:format-horizontal-align-left" />,
      onClick: () => {
        void clearLeftTabs(tabId);
      },
    },
    {
      node: "item",
      name: t("dropdown.closeRight"),
      disabled: disabledKeys.includes("closeRight"),
      icon: <SvgIcon className="text-icon" icon="mdi:format-horizontal-align-right" />,
      onClick: () => {
        void clearRightTabs(tabId);
      },
    },
    {
      node: "item",
      name: t("dropdown.closeAll"),
      icon: <SvgIcon className="text-icon" icon="mdi:minus" />,
      onClick: () => {
        void clearTabs();
      },
    },
  ];

  if (!isHomeTab) {
    menu.push({ node: "divider" });
    menu.push(
      isFixed
        ? {
            node: "item",
            name: t("dropdown.unpin"),
            icon: <SvgIcon className="text-icon" icon="mdi:pin-off-outline" />,
            onClick: () => {
              unfixTab(tabId);
            },
          }
        : {
            node: "item",
            name: t("dropdown.pin"),
            icon: <SvgIcon className="text-icon" icon="mdi:pin-outline" />,
            onClick: () => {
              fixTab(tabId);
            },
          },
    );
  }

  return (
    <Dropdown clickToHide menu={menu} trigger="contextMenu">
      {children}
    </Dropdown>
  );
};
