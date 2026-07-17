/**
 * 色板色号
 *
 * 主色号为 500
 */
export type ColorPaletteNumber = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/** 色板 */
export type ColorPalette = {
  /** 颜色十六进制值 */
  hex: string;
  /**
   * 色号
   *
   * - 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
   */
  number: ColorPaletteNumber;
};

/** 色板系列 */
export type ColorPaletteFamily = {
  /** 色板系列名称 */
  name: string;
  /** 色板列表 */
  palettes: ColorPalette[];
};

/** 带色差的色板 */
export type ColorPaletteWithDelta = ColorPalette & {
  delta: number;
};

/** 带最近色板的色板系列 */
export type ColorPaletteFamilyWithNearestPalette = ColorPaletteFamily & {
  nearestLightnessPalette: ColorPaletteWithDelta;
  nearestPalette: ColorPaletteWithDelta;
};

/** 色板匹配结果 */
export type ColorPaletteMatch = ColorPaletteFamily & {
  /** 色板的颜色映射 */
  colorMap: Map<ColorPaletteNumber, ColorPalette>;
  /**
   * 色板的主色
   *
   * 色号为 500
   */
  main: ColorPalette;
  /** 色板的匹配色 */
  match: ColorPalette;
};

/**
 * 色板的颜色索引
 *
 * 从左到右,颜色由浅到深,6 为主色
 */
export type ColorIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/**
 * 色板生成算法
 *
 * - hsv: HSV 步进算法(经典,索引 6 为主色)
 * - recommended: 基于 Tailwind 内置色板的 deltaE 最近系列匹配
 * - oklch: OKLCH 感知均匀算法,带色度补偿和色相旋转
 */
export type PaletteAlgorithm = "hsv" | "oklch" | "recommended";
