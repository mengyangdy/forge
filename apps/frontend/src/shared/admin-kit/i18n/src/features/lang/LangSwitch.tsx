import { ButtonIcon } from "@/shared/ui/semi";
import { Dropdown } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";

import { useLang } from "../../hooks/use-lang";

interface LangSwitchProps {
  /** Extra class name applied to the icon button. */
  className?: string;
  /** Whether to show the language switch tooltip. */
  showTooltip?: boolean;
  /** Whether the language switch should be rendered by the host admin layout. */
  visible?: boolean;
}

const LangSwitch = (props: LangSwitchProps) => {
  const { className, showTooltip = true, visible = true } = props;

  const { t } = useTranslation();

  const { locale, localeOptions, setLocale } = useLang();

  const tooltipContent = showTooltip ? t("icon.lang") : "";

  if (!visible) return null;

  return (
    <Dropdown
      clickToHide
      menu={localeOptions.map((item) => ({
        node: "item" as const,
        name: item.label,
        active: item.key === locale,
        onClick: () => setLocale(item.key as I18n.LangType),
      }))}
      position="bottomRight"
      trigger="click"
    >
      <ButtonIcon
        className={className}
        hoverAnimation="scale"
        icon="heroicons:language"
        tooltipContent={tooltipContent}
        tooltipPlacement="left"
      />
    </Dropdown>
  );
};

export default LangSwitch;
