import { create } from "zustand";
import { defaultLangConfig } from "../config/default";
import type { LangOption, LangType } from "../types";

interface LangStore {
  locale: LangType;
  localeOptions: LangOption[];
  fallbackLang: LangType;
  setLocale: (locale: LangType) => void;
  setLocaleOptions: (options: LangOption[]) => void;
  setFallbackLang: (fallback: LangType) => void;
}

export const useLangStore = create<LangStore>((set) => ({
  locale: defaultLangConfig.defaultLang,
  localeOptions: defaultLangConfig.langOptions,
  fallbackLang: defaultLangConfig.fallbackLang,
  setLocale: (locale) => set({ locale }),
  setLocaleOptions: (localeOptions) => set({ localeOptions }),
  setFallbackLang: (fallbackLang) => set({ fallbackLang }),
}));
