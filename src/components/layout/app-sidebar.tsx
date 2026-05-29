import { getTranslations } from "next-intl/server";
import { FileText, Plus } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { MainNav } from "@/components/layout/main-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ProSidebarCard } from "@/components/billing/pro-sidebar-card";
import { LogoutButton } from "@/components/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  userEmail?: string;
};

export async function AppSidebar({ userEmail }: AppSidebarProps) {
  const t = await getTranslations("nav");
  const tSite = await getTranslations("site");

  return (
    <aside className="hidden h-dvh w-[17rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar shadow-[4px_0_24px_oklch(0.22_0.02_260/0.04)] md:flex">
      <div className="flex h-[4.25rem] items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <FileText className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href="/dashboard"
            className="truncate text-[0.9375rem] font-bold tracking-tight"
          >
            {siteConfig.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {tSite("tagline")}
          </p>
        </div>
        <LanguageSwitcher compact />
      </div>

      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4"
        aria-label={t("mainNavigation")}
      >
        <MainNav variant="sidebar" />
      </nav>

      <div className="space-y-3 border-t border-sidebar-border p-4">
        <ProSidebarCard />
        <Link
          href="/quote-builder"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 w-full shadow-sm"
          )}
        >
          <Plus data-icon="inline-start" className="size-4" />
          {t("newEstimate")}
        </Link>
        {userEmail ? (
          <p className="truncate px-1 text-center text-[0.6875rem] text-muted-foreground">
            {userEmail}
          </p>
        ) : null}
        <LogoutButton />
        <p className="text-center text-[0.6875rem] text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </aside>
  );
}
