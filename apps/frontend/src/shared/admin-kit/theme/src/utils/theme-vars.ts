import { getColorPalette } from "@forge/shared/color";
import type { ColorPaletteNumber } from "@forge/shared/color";
import type { ThemeColor } from "../types";

/** UnoCSS 调色板需要的色号（对应 @sa/uno-config 的 var(--{name}-{n})） */
const PALETTE_NUMBERS: ColorPaletteNumber[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
];

/**
 * themeColors 里的 key → Semi 语义色名
 *
 * Semi 用 danger 表示错误色，其余同名。
 */
const SEMI_COLOR_NAME: Record<keyof ThemeColor, string> = {
  primary: "primary",
  info: "info",
  success: "success",
  warning: "warning",
  error: "danger",
};

/**
 * 由单一主色（及语义色）生成整套 CSS 变量，供 UnoCSS 与 Semi 共同消费。
 *
 * - UnoCSS：`--{name}`（DEFAULT）与 `--{name}-50 ~ --{name}-950`
 * - Semi：`--semi-color-{name}` 及其 hover/active/disabled/light-* 变体
 *
 * 这是替代原 antd `cssVar` 的“调色板生成器”，让主色统一驱动两套样式系统。
 */
export function buildThemeCssVars(themeColors: ThemeColor): Record<string, string> {
  const vars: Record<string, string> = {};

  (Object.keys(themeColors) as (keyof ThemeColor)[]).forEach((key) => {
    const seed = themeColors[key];
    if (!seed) return;

    const palette = getColorPalette(seed);
    const shade = (n: ColorPaletteNumber) => palette.get(n) ?? seed;

    // UnoCSS：DEFAULT + 数值色阶
    vars[`--${key}`] = seed;
    PALETTE_NUMBERS.forEach((n) => {
      vars[`--${key}-${n}`] = shade(n);
    });

    // Semi：语义色 + 交互态
    const semiName = SEMI_COLOR_NAME[key];
    vars[`--semi-color-${semiName}`] = seed;
    vars[`--semi-color-${semiName}-hover`] = shade(600);
    vars[`--semi-color-${semiName}-active`] = shade(700);
    vars[`--semi-color-${semiName}-disabled`] = shade(200);
    vars[`--semi-color-${semiName}-light-default`] = shade(50);
    vars[`--semi-color-${semiName}-light-hover`] = shade(100);
    vars[`--semi-color-${semiName}-light-active`] = shade(200);
  });

  return vars;
}

/**
 * 将主色调色板注入到 `<html>`。
 *
 * 在主色变化时调用（见 ThemeEffect），使 `bg-primary` 等 uno 工具类与 Semi 组件同步生效。
 */
export function addThemeVarsToHtml(themeColors: ThemeColor): void {
  const root = document.documentElement;
  const vars = buildThemeCssVars(themeColors);

  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
}
