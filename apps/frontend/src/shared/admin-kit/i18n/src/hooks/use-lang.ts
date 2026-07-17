import { useLangStore } from "../atoms/lang";
import { getFallbackLocale, getLocaleOptions, loadLocaleMessages } from "../i18n";
import type { LangOption, LangType } from "../types";

export interface UseLangReturn {
  /** Change the current language. */
  changeLocale: (lang: LangType) => void;
  /** Current language option. */
  currentOption: LangOption | undefined;

  /** Fallback language. */
  fallbackLang: LangType;
  /** Check whether the supplied language is active. */
  isCurrentLang: (lang: LangType) => boolean;

  /** Current language. */
  locale: LangType;
  /** Language options for switch UI. */
  localeOptions: LangOption[];

  /** Alias of changeLocale. */
  setLocale: (lang: LangType) => void;
}

/** Hook for language management */
export function useLang(): UseLangReturn {
  const locale = useLangStore((state) => state.locale);
  const localeOptions = useLangStore((state) => state.localeOptions);
  const fallbackLang = useLangStore((state) => state.fallbackLang);
  const setLocaleState = useLangStore((state) => state.setLocale);

  const currentOption = localeOptions.find((opt) => opt.key === locale);

  function changeLocale(lang: LangType) {
    setLocaleState(lang);
    void loadLocaleMessages(lang);
  }

  return {
    locale,
    currentOption,
    localeOptions: localeOptions.length > 0 ? localeOptions : getLocaleOptions(),
    fallbackLang: fallbackLang || getFallbackLocale(),
    changeLocale,
    setLocale: changeLocale,
    isCurrentLang: (lang: LangType) => locale === lang,
  };
}
