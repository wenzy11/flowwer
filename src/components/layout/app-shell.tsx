import type { ReactNode } from "react";
import { FileText } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { siteConfig } from "@/config/site";

type AppShellProps = {
  children: ReactNode;
  userEmail?: string;
};

export async function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="flex min-h-dvh qf-surface">
      <AppSidebar userEmail={userEmail} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-border/80 bg-card/90 px-4 backdrop-blur-md md:hidden">
          <Link
            href="/dashboard"
            className="flex min-w-0 flex-1 items-center gap-2.5 font-semibold tracking-tight"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <FileText className="size-4" aria-hidden />
            </span>
            <span className="truncate">{siteConfig.name}</span>
          </Link>
          <LanguageSwitcher compact />
        </header>

        <main className="flex-1 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
