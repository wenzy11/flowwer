"use client";

import { useEffect } from "react";

import { isRtlLocale } from "@/i18n/locales";

export function SetLocaleHtml({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtlLocale(locale) ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
