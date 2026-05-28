import { defineRouting } from "next-intl/routing";

import { defaultLocale, locales } from "./locales";

export { defaultLocale, locales, type Locale } from "./locales";

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});
