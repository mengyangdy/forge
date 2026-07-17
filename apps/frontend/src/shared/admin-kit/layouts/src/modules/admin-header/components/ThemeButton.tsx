import { ButtonIcon } from "@/shared/ui/semi";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { useAdminState } from "../../../state/use-admin-state";

const ThemeButton = memo(() => {
  const { t } = useTranslation();

  const { openThemeDrawer } = useAdminState();

  return (
    <ButtonIcon
      className="px-12px"
      hoverAnimation="pulse"
      icon="majesticons:color-swatch-line"
      tooltipContent={t("icon.themeConfig")}
      onClick={openThemeDrawer}
    />
  );
});

export default ThemeButton;
