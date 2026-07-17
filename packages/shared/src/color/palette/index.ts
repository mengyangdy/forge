import type { AnyColor } from "colord";
import { getHex } from "../shared";
import type { ColorPaletteNumber, PaletteAlgorithm } from "../types";
import { getHsvColorPalette } from "./hsv";
import { generateOklchPalette } from "./oklch";
import { getRecommendedColorPalette } from "./recommend";

export * from "./oklch";

export { getHsvColorPalette, getHsvPaletteColorByIndex } from "./hsv";
export { getRecommendedColorPalette, getRecommendedPaletteColorByNumber } from "./recommend";

/**
 * 根据颜色生成调色板
 *
 * @param color 任意有效的颜色值
 * @param algorithm 调色板生成算法（默认: 'hsv'）
 */
export function getColorPalette(color: AnyColor, algorithm: PaletteAlgorithm = "hsv") {
  const colorMap = new Map<ColorPaletteNumber, string>();

  if (algorithm === "recommended") {
    const colorPalette = getRecommendedColorPalette(getHex(color));
    colorPalette.palettes.forEach((palette) => {
      colorMap.set(palette.number, palette.hex);
    });
  } else if (algorithm === "oklch") {
    const family = generateOklchPalette(getHex(color));
    family.palettes.forEach((palette) => {
      colorMap.set(palette.number, palette.hex);
    });
  } else {
    const colors = getHsvColorPalette(color);

    const colorNumbers: ColorPaletteNumber[] = [
      50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
    ];

    colorNumbers.forEach((number, index) => {
      colorMap.set(number, colors[index]);
    });
  }

  return colorMap;
}

/**
 * 根据色号获取调色板颜色
 *
 * @param color 提供的颜色
 * @param number 调色板色号
 * @param algorithm 调色板生成算法（默认: 'hsv'）
 */
export function getPaletteColorByNumber(
  color: AnyColor,
  number: ColorPaletteNumber,
  algorithm: PaletteAlgorithm = "hsv",
) {
  const colorMap = getColorPalette(color, algorithm);

  return colorMap.get(number as ColorPaletteNumber)!;
}
