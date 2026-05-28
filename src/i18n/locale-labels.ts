import type { Locale } from "@/i18n/locales";

/** Native language names for the switcher */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  hi: "हिन्दी",
  es: "Español",
  fr: "Français",
  ar: "العربية",
  pt: "Português",
  ru: "Русский",
  ja: "日本語",
  de: "Deutsch",
  ko: "한국어",
  tr: "Türkçe",
  vi: "Tiếng Việt",
  it: "Italiano",
  pl: "Polski",
  uk: "Українська",
  nl: "Nederlands",
  id: "Bahasa Indonesia",
  ro: "Română",
  sv: "Svenska",
};

export function getLocaleLabel(locale: string): string {
  return localeLabels[locale as Locale] ?? locale;
}
