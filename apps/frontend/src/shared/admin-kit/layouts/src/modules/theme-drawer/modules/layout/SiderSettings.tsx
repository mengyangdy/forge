import { useSettingsTheme } from "@/shared/admin-theme";
import { SvgIcon } from "@/shared/ui/compose";
import {
  InputNumber as AInputNumber,
  Switch as ASwitch,
  Tooltip as ATooltip,
} from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";

import {
  HYBRID_LAYOUT_MODES,
  LAYOUT_MODE_VERTICAL,
  LAYOUT_MODE_VERTICAL_MIX,
  MIX_OR_HYBRID_LAYOUT_MODES,
} from "../../../../constant";
import AnimatedCollapse from "../../components/AnimatedCollapse";
import SettingItem from "../../components/SettingItem";

const SiderSettings = () => {
  const { t } = useTranslation();

  const { layout, setSettings, sider } = useSettingsTheme();

  const layoutMode = layout.mode;
  const isMixLayoutMode = MIX_OR_HYBRID_LAYOUT_MODES.includes(layoutMode);
  const isHybridLayoutMode = HYBRID_LAYOUT_MODES.includes(layoutMode);

  const updateSider = (patch: Partial<typeof sider>) => {
    setSettings({
      sider: {
        ...sider,
        ...patch,
      },
    });
  };

  const handleWidthChange = (width: string | number) => {
    const next = typeof width === "number" ? width : Number(width);
    if (Number.isNaN(next)) return;
    updateSider({ width: next });
  };

  const handleCollapsedWidthChange = (collapsedWidth: string | number) => {
    const next = typeof collapsedWidth === "number" ? collapsedWidth : Number(collapsedWidth);
    if (Number.isNaN(next)) return;
    updateSider({ collapsedWidth: next });
  };

  const handleMixWidthChange = (mixWidth: string | number) => {
    const next = typeof mixWidth === "number" ? mixWidth : Number(mixWidth);
    if (Number.isNaN(next)) return;
    updateSider({ mixWidth: next });
  };

  const handleMixCollapsedWidthChange = (mixCollapsedWidth: string | number) => {
    const next =
      typeof mixCollapsedWidth === "number" ? mixCollapsedWidth : Number(mixCollapsedWidth);
    if (Number.isNaN(next)) return;
    updateSider({ mixCollapsedWidth: next });
  };

  const handleMixChildMenuWidthChange = (mixChildMenuWidth: string | number) => {
    const next =
      typeof mixChildMenuWidth === "number" ? mixChildMenuWidth : Number(mixChildMenuWidth);
    if (Number.isNaN(next)) return;
    updateSider({ mixChildMenuWidth: next });
  };

  const handleAutoSelectFirstMenuChange = (autoSelectFirstMenu: boolean) => {
    updateSider({ autoSelectFirstMenu });
  };

  return (
    <div className="flex-col-stretch gap-12px">
      <AnimatedCollapse
        className="flex-col-stretch gap-12px"
        visible={layoutMode === LAYOUT_MODE_VERTICAL}
      >
        <SettingItem label={t("theme.layout.sider.width")}>
          <AInputNumber
            className="w-120px"
            min={0}
            step={1}
            value={sider.width}
            onChange={handleWidthChange}
          />
        </SettingItem>

        <SettingItem label={t("theme.layout.sider.collapsedWidth")}>
          <AInputNumber
            className="w-120px"
            min={0}
            step={1}
            value={sider.collapsedWidth}
            onChange={handleCollapsedWidthChange}
          />
        </SettingItem>
      </AnimatedCollapse>

      <AnimatedCollapse className="flex-col-stretch gap-12px" visible={isMixLayoutMode}>
        <SettingItem label={t("theme.layout.sider.mixWidth")}>
          <AInputNumber
            className="w-120px"
            min={0}
            step={1}
            value={sider.mixWidth}
            onChange={handleMixWidthChange}
          />
        </SettingItem>

        <SettingItem label={t("theme.layout.sider.mixCollapsedWidth")}>
          <AInputNumber
            className="w-120px"
            min={0}
            step={1}
            value={sider.mixCollapsedWidth}
            onChange={handleMixCollapsedWidthChange}
          />
        </SettingItem>
      </AnimatedCollapse>

      <AnimatedCollapse visible={layoutMode === LAYOUT_MODE_VERTICAL_MIX}>
        <SettingItem label={t("theme.layout.sider.mixChildMenuWidth")}>
          <AInputNumber
            className="w-120px"
            min={0}
            step={1}
            value={sider.mixChildMenuWidth}
            onChange={handleMixChildMenuWidthChange}
          />
        </SettingItem>
      </AnimatedCollapse>

      <AnimatedCollapse visible={isHybridLayoutMode}>
        <SettingItem
          label={t("theme.layout.sider.autoSelectFirstMenu")}
          suffix={
            <ATooltip content={t("theme.layout.sider.autoSelectFirstMenuTip")}>
              <SvgIcon className="text-icon-info" icon="mdi:information-outline" />
            </ATooltip>
          }
        >
          <ASwitch checked={sider.autoSelectFirstMenu} onChange={handleAutoSelectFirstMenuChange} />
        </SettingItem>
      </AnimatedCollapse>
    </div>
  );
};

export default SiderSettings;
