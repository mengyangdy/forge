import { useSettingsTheme } from "@/shared/admin-theme";
import { Button, Switch, Tooltip } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";

import SettingItem from "../../components/SettingItem";

import CustomPicker from "./CustomPicker";

const ThemeColor = () => {
  const { t } = useTranslation();

  const { isInfoFollowPrimary, recommendColor, setSettings, themeColor, themeColors } =
    useSettingsTheme();

  function handleRecommendColorChange(value: boolean) {
    setSettings({ recommendColor: value });
  }

  return (
    <div className="flex-col-stretch gap-12px">
      <Tooltip
        position="topLeft"
        content={
          <p>
            <span className="pr-12px">{t("theme.appearance.recommendColorDesc")}</span>
            <br />
            <Button
              className="text-gray"
              theme="borderless"
              type="tertiary"
              onClick={() =>
                window.open("https://uicolors.app/create", "_blank", "noopener,noreferrer")
              }
            >
              https://uicolors.app/create
            </Button>
          </p>
        }
      >
        <div>
          <SettingItem key="recommend-color" label={t("theme.appearance.recommendColor")}>
            <Switch checked={recommendColor} onChange={handleRecommendColorChange} />
          </SettingItem>
        </div>
      </Tooltip>
      {Object.entries(themeColors).map(([key, value], index) => (
        <CustomPicker
          index={index}
          isInfoFollowPrimary={isInfoFollowPrimary}
          key={key}
          label={key}
          theme={themeColor}
          value={value as string}
        />
      ))}
    </div>
  );
};

export default ThemeColor;
