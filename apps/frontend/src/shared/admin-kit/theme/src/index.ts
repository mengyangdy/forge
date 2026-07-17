// Semi UI helpers（含历史 message/Modal/Notification 兼容别名）
export {
  SemiProvider,
  ThemeWatermark,
  destroyMessage,
  destroyNotification,
  destroySemiToast,
  showConfirmModal,
  showErrorMessage,
  showErrorModal,
  showErrorNotification,
  showInfoMessage,
  showInfoModal,
  showInfoNotification,
  showLoadingMessage,
  showMessage,
  showModal,
  showNotification,
  showSemiConfirmModal,
  showSemiErrorToast,
  showSemiInfoToast,
  showSemiSuccessToast,
  showSemiWarningToast,
  showSuccessMessage,
  showSuccessModal,
  showSuccessNotification,
  showWarningMessage,
  showWarningModal,
  showWarningNotification,
} from "./semi";

// Components
export { default as ThemeEffect } from "./components/ThemeEffect";
export { default as ThemeSchemaSegmented } from "./components/ThemeSchemaSegmented";
export { default as ThemeSchemaSwitch } from "./components/ThemeSchemaSwitch";

// Config
export { defaultThemeSettings, themeSchemeIcons } from "./config";

// Hooks
export { useThemeStore, useTheme, useTheme as useSettingsTheme } from "./hooks";
export type { UseThemeReturn } from "./hooks";

// Presets
export {
  azir,
  compact,
  dark,
  defaultPreset,
  getAllPresets,
  getPreset,
  presets,
  shadcn,
} from "./presets";
export type { PresetName } from "./presets";

// Setup
export { defineThemeOverrides, setupTheme } from "./setup";

// Types
export type {
  BaseToken,
  BaseWatermarkSettings,
  ColorPaletteNumber,
  OtherColor,
  ThemeColor,
  ThemeColorKey,
  ThemeIcons,
  ThemeLayoutMode,
  ThemeMode,
  ThemePageAnimateMode,
  ThemePaletteColor,
  ThemePreset,
  ThemePresetMeta,
  ThemeScrollMode,
  ThemeSettingToken,
  ThemeSettingTokenBoxShadow,
  ThemeSettingTokenColor,
  ThemeTabMode,
  ThemeTokenColor,
  ThemeTokenCSSVars,
} from "./types";

// Utils
export {
  clearAuxiliaryColorModes,
  getDefaultThemeSettings,
  getThemeColors,
  isDarkModeClass,
  mergeThemeSettings,
  toggleAuxiliaryColorModes,
  toggleCssDarkMode,
  toggleSemiThemeMode,
} from "./utils";
