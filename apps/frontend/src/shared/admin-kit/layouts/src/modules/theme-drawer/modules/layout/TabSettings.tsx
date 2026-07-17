import { useSettingsTheme } from "@/shared/admin-theme";
import { SvgIcon } from "@/shared/ui/compose";
import {
  InputNumber as AInputNumber,
  Select as ASelect,
  Switch as ASwitch,
  Tooltip as ATooltip,
} from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";

import { themeTabModeOptions, translateOptions } from "../../../../options";

import AnimatedCollapse from "../../components/AnimatedCollapse";
import SettingItem from "../../components/SettingItem";

const TabSettings = () => {
  const { t } = useTranslation();

  const { setSettings, tab } = useSettingsTheme();

  const tabModeOptions = translateOptions(themeTabModeOptions);

  const updateTab = (patch: Partial<typeof tab>) => {
    setSettings({
      tab: {
        ...tab,
        ...patch,
      },
    });
  };

  const handleTabVisibleChange = (visible: boolean) => {
    updateTab({ visible });
  };

  const handleTabCacheChange = (cache: boolean) => {
    updateTab({ cache });
  };

  const handleTabHeightChange = (height: string | number) => {
    const next = typeof height === "number" ? height : Number(height);
    if (Number.isNaN(next)) return;
    updateTab({ height: next });
  };

  const handleTabModeChange = (mode: string | string[] | undefined) => {
    if (typeof mode !== "string") return;
    updateTab({ mode: mode as UnionKey.ThemeTabMode });
  };

  const handleCloseTabByMiddleClickChange = (closeTabByMiddleClick: boolean) => {
    updateTab({ closeTabByMiddleClick });
  };

  return (
    <div className="flex-col-stretch gap-12px">
      <SettingItem label={t("theme.layout.tab.visible")}>
        <ASwitch checked={tab.visible} onChange={handleTabVisibleChange} />
      </SettingItem>

      <AnimatedCollapse className="flex-col-stretch gap-12px" visible={tab.visible}>
        <SettingItem
          label={t("theme.layout.tab.cache")}
          suffix={
            <ATooltip content={t("theme.layout.tab.cacheTip")}>
              <SvgIcon className="text-icon-info" icon="mdi:information-outline" />
            </ATooltip>
          }
        >
          <ASwitch checked={tab.cache} onChange={handleTabCacheChange} />
        </SettingItem>

        <SettingItem label={t("theme.layout.tab.height")}>
          <AInputNumber
            className="w-120px"
            min={0}
            step={1}
            value={tab.height}
            onChange={handleTabHeightChange}
          />
        </SettingItem>

        <SettingItem label={t("theme.layout.tab.mode.title")}>
          <ASelect
            className="w-120px"
            optionList={tabModeOptions}
            size="small"
            value={tab.mode}
            onChange={handleTabModeChange}
          />
        </SettingItem>

        <SettingItem
          label={t("theme.layout.tab.closeByMiddleClick")}
          suffix={
            <ATooltip content={t("theme.layout.tab.closeByMiddleClickTip")}>
              <SvgIcon className="text-icon-info" icon="mdi:information-outline" />
            </ATooltip>
          }
        >
          <ASwitch
            checked={tab.closeTabByMiddleClick}
            onChange={handleCloseTabByMiddleClickChange}
          />
        </SettingItem>
      </AnimatedCollapse>
    </div>
  );
};

export default TabSettings;
