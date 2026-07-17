import { getPaletteColorByNumber } from "@forge/shared/color";
import { useNow, useSystemTheme } from "@/shared/hooks/web";
import { formatDateTime } from "@forge/shared/utils";
import { useMemo } from "react";
import { create } from "zustand";
import { defaultThemeSettings } from "../config/default";
import type { ThemeColor, ThemeColorKey, ThemeLayoutMode, ThemeMode } from "../types";

interface ThemeStore {
  settings: Theme.ThemeSetting;
  userName: string | undefined;
  setSettings: (
    update: Partial<Theme.ThemeSetting> | ((prev: Theme.ThemeSetting) => Theme.ThemeSetting),
  ) => void;
  setUserName: (userName: string | undefined) => void;
  reset: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  settings: defaultThemeSettings,
  userName: undefined,
  setSettings: (update) =>
    set((state) => {
      const nextSettings =
        typeof update === "function" ? update(state.settings) : { ...state.settings, ...update };
      return { settings: nextSettings };
    }),
  setUserName: (userName) => set({ userName }),
  reset: () => set({ settings: defaultThemeSettings }),
}));

/**
 * Web theme hook
 *
 * Provides theme state management with a simple Zustand store approach. Derived values (isDarkMode, themeColors, tokens)
 * are computed via useMemo.
 *
 * UserName 通过 useThemeStore 全局共享，由 SemiProvider 自动写入，所有调用者无需传参即可获取完整的 watermarkContent。
 */
export function useTheme() {
  const userName = useThemeStore((state) => state.userName);
  const settings = useThemeStore((state) => state.settings);
  const setSettingsStore = useThemeStore((state) => state.setSettings);

  const { isDarkMode: systemIsDark } = useSystemTheme();

  const {
    now: watermarkTime,
    pause: pauseWatermarkTime,
    resume: resumeWatermarkTime,
  } = useNow({ interval: 1000, immediate: settings.watermark.visible });

  /** Dark mode */
  const darkMode = useMemo(() => {
    if (settings.themeScheme === "auto") {
      return systemIsDark;
    }
    return settings.themeScheme === "dark";
  }, [settings.themeScheme, systemIsDark]);

  /** Grayscale mode */
  const grayscaleMode = settings.grayscale;

  /** Colour weakness mode */
  const colourWeaknessMode = settings.colourWeakness;

  /** Theme colors */
  const themeColors = useMemo<ThemeColor>(() => {
    const { isInfoFollowPrimary, otherColor, themeColor } = settings;
    return {
      primary: themeColor,
      ...otherColor,
      info: isInfoFollowPrimary ? themeColor : otherColor.info,
    };
  }, [settings.themeColor, settings.otherColor, settings.isInfoFollowPrimary]);

  /** Settings JSON for comparison */
  const settingsJson = useMemo(() => JSON.stringify(settings), [settings]);

  /** Watermark time date formatter */
  const formattedWatermarkTime = useMemo(() => {
    const { watermark } = settings;
    return formatDateTime(watermarkTime, watermark.timeFormat);
  }, [watermarkTime, settings.watermark.timeFormat]);

  /** Watermark content */
  const watermarkContent = useMemo(() => {
    const { watermark } = settings;

    if (!watermark.visible) return "";

    let content = watermark.text;

    if (watermark.enableUserName && userName) {
      content = `${content} - ${userName}`;
    }

    if (watermark.enableTime) {
      content = `${content} - ${formattedWatermarkTime}`;
    }

    return content;
  }, [settings.watermark, userName, formattedWatermarkTime]);

  /** Update settings with partial update */
  function setSettings(update: Partial<Theme.ThemeSetting>) {
    setSettingsStore(update);
  }

  /**
   * Set theme scheme
   *
   * @param themeScheme
   */
  function setThemeScheme(themeScheme: ThemeMode) {
    setSettings({ themeScheme });
  }

  /**
   * Set grayscale value
   *
   * @param isGrayscale
   */
  function setGrayscale(isGrayscale: boolean) {
    setSettings({ grayscale: isGrayscale });
  }

  /**
   * Set colourWeakness value
   *
   * @param isColourWeakness
   */
  function setColourWeakness(isColourWeakness: boolean) {
    setSettings({ colourWeakness: isColourWeakness });
  }

  /** Toggle theme scheme */
  function toggleThemeScheme() {
    const themeSchemes: ThemeMode[] = ["light", "dark", "auto"];

    const index = themeSchemes.findIndex((item) => item === settings.themeScheme);

    const nextIndex = index === themeSchemes.length - 1 ? 0 : index + 1;

    const nextThemeScheme = themeSchemes[nextIndex];

    setThemeScheme(nextThemeScheme);
  }

  /**
   * Update theme colors
   *
   * @param key Theme color key
   * @param color Theme color
   */
  function updateThemeColors(key: ThemeColorKey, color: string) {
    let colorValue = color;

    if (settings.recommendColor) {
      // get a color palette by provided color and color name, and use the suitable color
      colorValue = getPaletteColorByNumber(color, 500, "recommended");
    }

    if (key === "primary") {
      setSettings({ themeColor: colorValue });
    } else {
      setSettings({ otherColor: { ...settings.otherColor, [key]: colorValue } });
    }
  }

  /**
   * Set theme layout
   *
   * @param mode Theme layout mode
   */
  function setThemeLayout(mode: ThemeLayoutMode) {
    setSettings({
      layout: {
        ...settings.layout,
        mode,
      },
    });
  }

  /**
   * Set watermark enable user name
   *
   * @param enable Whether to enable user name watermark
   */
  function setWatermarkEnableUserName(enable: boolean) {
    const update = {
      watermark: {
        ...settings.watermark,
        enableUserName: enable,
      },
    };

    setSettings(update);
  }

  /**
   * Set watermark enable time
   *
   * @param enable Whether to enable time watermark
   */
  function setWatermarkEnableTime(enable: boolean) {
    const update = {
      watermark: {
        ...settings.watermark,
        enableTime: enable,
      },
    };

    setSettings(update);
  }

  /** Only run timer when watermark is visible and time display is enabled */
  function updateWatermarkTimer() {
    const { watermark } = settings;

    const shouldRunTimer = watermark.visible && watermark.enableTime;

    if (shouldRunTimer) {
      resumeWatermarkTime();
    } else {
      pauseWatermarkTime();
    }
  }

  /** Reset to default settings */
  function reset() {
    setSettings(defaultThemeSettings);
  }

  return {
    settings,
    // Settings properties
    ...settings,
    // Computed values
    darkMode,
    themeColors,
    settingsJson,
    watermarkContent,
    grayscaleMode,
    colourWeaknessMode,
    // Methods
    setGrayscale,
    setColourWeakness,
    setThemeScheme,
    toggleThemeScheme,
    updateThemeColors,
    updateWatermarkTimer,
    setThemeLayout,
    setWatermarkEnableUserName,
    setWatermarkEnableTime,
    setSettings,
    reset,
  };
}

export type UseThemeReturn = ReturnType<typeof useTheme>;
