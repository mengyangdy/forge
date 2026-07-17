import { useCopy } from "@/shared/hooks/web";
import { showSemiErrorToast, showSemiSuccessToast, useSettingsTheme } from "@/shared/admin-theme";
import { Button as AButton } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";

const ConfigOperation = () => {
  const { t } = useTranslation();

  const { reset, setThemeScheme, settingsJson } = useSettingsTheme();

  const { copy } = useCopy();

  function formatConfigText() {
    const reg = /"\w+":/g;

    return settingsJson.replace(reg, (match: string) => match.replace(/"/g, ""));
  }

  async function handleCopy() {
    const text = formatConfigText();

    const success = await copy(text);

    if (success) {
      showSemiSuccessToast(t("theme.configOperation.copySuccessMsg"));
    } else {
      showSemiErrorToast(t("theme.configOperation.copyFailedMsg"));
    }
  }

  function handleReset() {
    setThemeScheme("light");

    reset();

    setTimeout(() => {
      showSemiSuccessToast(t("theme.configOperation.resetSuccessMsg"));
    }, 50);
  }

  return (
    <div className="flex justify-between">
      <AButton type="danger" theme="solid" onClick={handleReset}>
        {t("theme.configOperation.resetConfig")}
      </AButton>
      <AButton type="primary" theme="solid" onClick={handleCopy}>
        {t("theme.configOperation.copyConfig")}
      </AButton>
    </div>
  );
};

export default ConfigOperation;
