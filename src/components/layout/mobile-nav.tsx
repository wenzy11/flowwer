"use client";

import { useTranslations } from "next-intl";

import { MainNav } from "@/components/layout/main-nav";

export function MobileNav() {
  const t = useTranslations("nav");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_oklch(0.22_0.02_260/0.06)] backdrop-blur-lg supports-[backdrop-filter]:bg-card/90 md:hidden"
      aria-label={t("mobileNavigation")}
    >
      <div className="mx-auto flex max-w-lg items-end justify-around px-1 pt-1.5 pb-1">
        <MainNav variant="mobile" />
      </div>
    </nav>
  );
}
