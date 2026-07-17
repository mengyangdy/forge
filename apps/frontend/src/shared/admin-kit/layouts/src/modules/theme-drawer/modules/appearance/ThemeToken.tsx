import { useSettingsTheme } from "@/shared/admin-theme";
import { InputNumber as AInputNumber } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";

import SettingItem from "../../components/SettingItem";

const ThemeToken = () => {
  const { t } = useTranslation();

  const { setSettings, themeRadius, themeTextSize } = useSettingsTheme();

  function handleThemeRadiusChange(value: string | number) {
    const next = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(next)) return;

    setSettings({ themeRadius: next });
  }

  function handleThemeTextSizeChange(value: string | number) {
    const next = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(next)) return;

    setSettings({ themeTextSize: next });
  }

  return (
    <div className="flex-col-stretch gap-12px">
      <SettingItem label={t("theme.appearance.themeBase.textSize")}>
        <AInputNumber
          className="w-120px"
          min={0}
          step={1}
          value={themeTextSize}
          onChange={handleThemeTextSizeChange}
        />
      </SettingItem>

      <SettingItem label={t("theme.appearance.themeBase.radius")}>
        <AInputNumber
          className="w-120px"
          max={16}
          min={0}
          step={1}
          value={themeRadius}
          onChange={handleThemeRadiusChange}
        />
      </SettingItem>
    </div>
  );
};

export default ThemeToken;
