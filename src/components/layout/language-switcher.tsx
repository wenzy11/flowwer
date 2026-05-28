"use client";

import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";

import { getLocaleLabel } from "@/i18n/locale-labels";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("language");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function onLocaleChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale as Locale });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          compact
            ? "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
            : "inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
        }
        aria-label={t("switch")}
      >
        <Languages className="size-4" aria-hidden />
        {!compact ? (
          <span className="hidden sm:inline">{getLocaleLabel(locale)}</span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[min(20rem,70vh)] min-w-44 overflow-y-auto"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={onLocaleChange}
          >
            {locales.map((code) => (
              <DropdownMenuRadioItem key={code} value={code}>
                {getLocaleLabel(code)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
