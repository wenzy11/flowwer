/** 20 most-used locales for QuoteFlow */
export const locales = [
  "en",
  "zh",
  "hi",
  "es",
  "fr",
  "ar",
  "pt",
  "ru",
  "ja",
  "de",
  "ko",
  "tr",
  "vi",
  "it",
  "pl",
  "uk",
  "nl",
  "id",
  "ro",
  "sv",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const rtlLocales: Locale[] = ["ar"];

export function isRtlLocale(locale: string) {
  return rtlLocales.includes(locale as Locale);
}
