import { colord, extend } from "colord";
import type { AnyColor, HslColor, RgbColor } from "colord";
import labPlugin from "colord/plugins/lab";
import mixPlugin from "colord/plugins/mix";
import namesPlugin from "colord/plugins/names";

extend([namesPlugin, mixPlugin, labPlugin]);

export function isValidColor(color: AnyColor) {
  return colord(color).isValid();
}

export function getHex(color: AnyColor) {
  return colord(color).toHex();
}

export function getRgb(color: AnyColor) {
  return colord(color).toRgb();
}

export function getHsl(color: AnyColor) {
  return colord(color).toHsl();
}

export function getHsv(color: AnyColor) {
  return colord(color).toHsv();
}

export function getDeltaE(color1: AnyColor, color2: AnyColor) {
  return colord(color1).delta(color2);
}

export function transformHslToHex(color: HslColor) {
  return colord(color).toHex();
}

/**
 * 添加颜色透明度
 *
 * @param color - 颜色值
 * @param alpha - 透明度 (0 - 1)
 */
export function addColorAlpha(color: AnyColor, alpha: number) {
  return colord(color).alpha(alpha).toHex();
}

/**
 * 混合颜色
 *
 * @param firstColor - 第一个颜色
 * @param secondColor - 第二个颜色
 * @param ratio - 第二个颜色的比例 (0 - 1)
 */
export function mixColor(firstColor: AnyColor, secondColor: AnyColor, ratio: number) {
  return colord(firstColor).mix(secondColor, ratio).toHex();
}

/**
 * 将带透明度的颜色转换为相似的不透明颜色
 *
 * @param color - 颜色值
 * @param alpha - 透明度 (0 - 1)
 * @param bgColor 背景色（通常是白色或黑色）
 */
function calRgb(or: number, bg: number, al: number) {
  return bg + (or - bg) * al;
}

export function transformColorWithOpacity(color: string, alpha: number, bgColor = "#ffffff") {
  const originColor = addColorAlpha(color, alpha);
  const { b: oB, g: oG, r: oR } = colord(originColor).toRgb();

  const { b: bgB, g: bgG, r: bgR } = colord(bgColor).toRgb();

  const resultRgb: RgbColor = {
    b: calRgb(oB, bgB, alpha),
    g: calRgb(oG, bgG, alpha),
    r: calRgb(oR, bgR, alpha),
  };

  return colord(resultRgb).toHex();
}

/**
 * 判断是否为白色
 *
 * @param color - 颜色值
 */
export function isWhiteColor(color: AnyColor) {
  return colord(color).isEqual("#ffffff");
}

/**
 * 调整颜色明度
 *
 * @param color - 颜色值
 * @param amount - 调整量 (-100 到 100)，正值变亮，负值变暗
 */
export function adjustLightness(color: AnyColor, amount: number) {
  const c = colord(color);
  if (amount > 0) {
    return c.lighten(amount / 100).toHex();
  }
  return c.darken(Math.abs(amount) / 100).toHex();
}

/**
 * 使颜色变亮
 *
 * @param color - 颜色值
 * @param amount - 变亮程度 (0 - 100)
 */
export function lightenColor(color: AnyColor, amount: number) {
  return colord(color)
    .lighten(amount / 100)
    .toHex();
}

/**
 * 使颜色变暗
 *
 * @param color - 颜色值
 * @param amount - 变暗程度 (0 - 100)
 */
export function darkenColor(color: AnyColor, amount: number) {
  return colord(color)
    .darken(amount / 100)
    .toHex();
}

export { colord };
