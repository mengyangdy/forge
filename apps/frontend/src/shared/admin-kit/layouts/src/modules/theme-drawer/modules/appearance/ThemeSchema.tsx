// oxlint-disable import/no-unassigned-import
import { ThemeSchemaSegmented, useSettingsTheme } from "@/shared/admin-theme";
import { Switch as ASwitch } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";

import SettingItem from "../../components/SettingItem";

const DarkMode = () => {
  const { t } = useTranslation();

  const { colourWeakness, grayscale, setColourWeakness, setGrayscale, setSettings, sider } =
    useSettingsTheme();

  const handleSiderInvertedChange = (value: boolean) => {
    setSettings({ sider: { ...sider, inverted: value } });
  };

  return (
    <div className="flex-col-stretch gap-16px">
      <div className="i-flex-center">
        <ThemeSchemaSegmented />
      </div>

      <SettingItem label={t("theme.layout.sider.inverted")}>
        <ASwitch checked={sider.inverted} onChange={handleSiderInvertedChange} />
      </SettingItem>
      <SettingItem label={t("theme.appearance.grayscale")}>
        <ASwitch checked={grayscale} onChange={setGrayscale} />
      </SettingItem>

      <SettingItem label={t("theme.appearance.colourWeakness")}>
        <ASwitch checked={colourWeakness} onChange={setColourWeakness} />
      </SettingItem>
    </div>
  );
};

export default DarkMode;
