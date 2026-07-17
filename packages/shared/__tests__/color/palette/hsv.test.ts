import { describe, expect, it } from "vitest";
import { getHsvColorPalette, getHsvPaletteColorByIndex } from "../../../src/color/palette/hsv.js";

// ==================== getHsvPaletteColorByIndex ====================

describe("getHsvPaletteColorByIndex", () => {
  it("索引 6 应返回主色", () => {
    const result = getHsvPaletteColorByIndex("#1890ff", 6);
    expect(result.toLowerCase()).toBe("#1890ff");
  });

  it("应返回有效 hex 颜色", () => {
    for (let i = 1; i <= 11; i++) {
      const result = getHsvPaletteColorByIndex("#1890ff", i as any);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("浅色索引应比主色更亮", () => {
    const main = "#1890ff";
    const light = getHsvPaletteColorByIndex(main, 1);
    expect(light).not.toBe(main);
  });

  it("深色索引应比主色更深", () => {
    const main = "#1890ff";
    const dark = getHsvPaletteColorByIndex(main, 10);
    expect(dark).not.toBe(main);
  });

  it("无效颜色应抛出错误", () => {
    expect(() => getHsvPaletteColorByIndex("invalid", 6)).toThrow();
  });

  it("灰色应生成有效调色板", () => {
    for (let i = 1; i <= 11; i++) {
      const result = getHsvPaletteColorByIndex("#808080", i as any);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("浅色背景色应生成有效调色板", () => {
    for (let i = 1; i <= 11; i++) {
      const result = getHsvPaletteColorByIndex("#f5f0e8", i as any);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("高饱和红色应生成有效调色板", () => {
    for (let i = 1; i <= 11; i++) {
      const result = getHsvPaletteColorByIndex("#ff0033", i as any);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("红色系应生成有效调色板", () => {
    for (let i = 1; i <= 11; i++) {
      const result = getHsvPaletteColorByIndex("#ff0011", i as any);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

// ==================== getHsvColorPalette ====================

describe("getHsvColorPalette", () => {
  it("应返回 11 个颜色", () => {
    const palette = getHsvColorPalette("#1890ff");
    expect(palette).toHaveLength(11);
  });

  it("所有颜色应为有效 hex", () => {
    const palette = getHsvColorPalette("#1890ff");
    palette.forEach((color) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it("索引 5（第 6 个）应为主色", () => {
    const palette = getHsvColorPalette("#1890ff");
    expect(palette[5].toLowerCase()).toBe("#1890ff");
  });

  it("深色主题应返回不同颜色", () => {
    const light = getHsvColorPalette("#1890ff", false);
    const dark = getHsvColorPalette("#1890ff", true);
    expect(light).not.toEqual(dark);
  });

  it("深色主题应返回 11 个颜色", () => {
    const dark = getHsvColorPalette("#1890ff", true);
    expect(dark).toHaveLength(11);
  });

  it("不同主色应生成不同调色板", () => {
    const red = getHsvColorPalette("#ff0000");
    const blue = getHsvColorPalette("#0000ff");
    expect(red).not.toEqual(blue);
  });
});
