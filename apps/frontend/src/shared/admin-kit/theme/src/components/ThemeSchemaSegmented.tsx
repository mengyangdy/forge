import { SvgIcon } from "@/shared/ui/compose";
import { RadioGroup } from "@douyinfe/semi-ui";
import { useTheme } from "../hooks/use-theme";
import { icons } from "./shared";

const ThemeMode = ["auto", "dark", "light"] satisfies Theme.ThemeMode[];

const OPTIONS = Object.values(ThemeMode).map((item) => ({
  label: (
    <div className="w-[70px] flex justify-center">
      <SvgIcon className="text-icon-small h-28px" icon={icons[item]} />
    </div>
  ),
  value: item,
}));

const ThemeSchemaSegmented = () => {
  const { setThemeScheme, themeScheme } = useTheme();

  return (
    <RadioGroup
      buttonSize="middle"
      className="bg-layout"
      options={OPTIONS}
      type="button"
      value={themeScheme}
      onChange={(e) => setThemeScheme(e.target.value as Theme.ThemeMode)}
    />
  );
};

export default ThemeSchemaSegmented;
