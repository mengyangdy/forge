import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";

import { useTheme } from "../hooks";

interface ThemeWatermarkProps {
  children: ReactNode;
}

/**
 * 轻量 CSS 水印（canvas 平铺）。
 * 使用 canvas → data URL + background 平铺，不依赖第三方组件。
 */
export default function ThemeWatermark(props: ThemeWatermarkProps) {
  const { children } = props;
  const { watermark, watermarkContent } = useTheme();

  const overlayStyle = useMemo<CSSProperties | undefined>(() => {
    if (!watermark.visible || !watermarkContent) return undefined;

    const { font, height = 128, rotate = -22, width = 240, zIndex = 9 } = watermark.settings;

    const canvas = document.createElement("canvas");
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width / 2, height / 2);
    ctx.rotate((Math.PI / 180) * rotate);
    ctx.font = `${font?.fontSize ?? 16}px sans-serif`;
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(watermarkContent), 0, 0);

    return {
      backgroundImage: `url(${canvas.toDataURL()})`,
      backgroundRepeat: "repeat",
      inset: 0,
      pointerEvents: "none",
      position: "absolute",
      zIndex,
    };
  }, [watermark.settings, watermark.visible, watermarkContent]);

  return (
    <div className="relative h-full">
      {overlayStyle ? <div aria-hidden style={overlayStyle} /> : null}
      {children}
    </div>
  );
}
