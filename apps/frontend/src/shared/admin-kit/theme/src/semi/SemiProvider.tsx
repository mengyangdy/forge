import { ConfigProvider } from "@douyinfe/semi-ui";
import type { Locale } from "@douyinfe/semi-ui/lib/es/locale/interface";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { useTheme, useThemeStore } from "../hooks";
import { toggleSemiThemeMode } from "../utils/dark-mode";
import ThemeWatermark from "./ThemeWatermark";

interface SemiProviderProps {
  /** 应用内容 */
  children: ReactNode;
  /** Semi 国际化 locale */
  locale?: Locale;
  /** 用户名（用于水印，写入全局 store） */
  userName?: string;
}

/**
 * Semi Design 统一 Provider
 *
 * - ConfigProvider：locale / direction
 * - 暗色：同步 body[theme-mode=dark]
 * - ThemeWatermark：全局 CSS 水印
 */
const SemiProvider = (props: SemiProviderProps) => {
  const { children, locale, userName } = props;
  const { darkMode } = useTheme();
  const setUserName = useThemeStore((state) => state.setUserName);

  useEffect(() => {
    setUserName(userName);
  }, [userName, setUserName]);

  useEffect(() => {
    toggleSemiThemeMode(darkMode);
  }, [darkMode]);

  return (
    <ConfigProvider direction="ltr" locale={locale}>
      <ThemeWatermark>{children}</ThemeWatermark>
    </ConfigProvider>
  );
};

export default SemiProvider;
