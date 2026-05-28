import { getTranslations } from "next-intl/server";
import { FileText, Sparkles } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { siteConfig } from "@/config/site";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tSite = await getTranslations("site");
  const tAuth = await getTranslations("auth");

  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <aside className="relative hidden w-[42%] max-w-xl flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground md:flex lg:w-[45%]">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, oklch(1 0 0 / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.45 0.12 166 / 0.4) 0%, transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-3 font-bold tracking-tight"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <FileText className="size-5" aria-hidden />
            </span>
            {siteConfig.name}
          </Link>
        </div>
        <div className="relative space-y-4">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold leading-tight lg:text-3xl">
            {tAuth("brandHeadline")}
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/85 lg:text-base">
            {tAuth("brandSubline")}
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border/80 bg-card px-4 md:h-16 md:border-0 md:bg-transparent md:px-8 md:pt-8">
          <Link
            href="/auth/login"
            className="flex min-w-0 items-center gap-2.5 font-bold tracking-tight md:hidden"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="size-4" aria-hidden />
            </span>
            <span className="truncate">{siteConfig.name}</span>
          </Link>
          <p className="hidden truncate text-xs text-muted-foreground sm:block md:ml-auto">
            {tSite("tagline")}
          </p>
          <LanguageSwitcher compact />
        </header>
        <main className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
