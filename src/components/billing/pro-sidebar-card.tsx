import { getTranslations } from "next-intl/server";
import { Crown, Sparkles } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { userHasActiveSubscription } from "@/lib/billing/subscription";
import { requireUserId } from "@/lib/auth/user";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function ProSidebarCard() {
  const userId = await requireUserId();
  const hasPro = await userHasActiveSubscription(userId);
  const t = await getTranslations("nav.pro");

  if (hasPro) {
    return (
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Crown className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Pro
            </p>
            <p className="text-sm font-medium">{t("active")}</p>
          </div>
        </div>
        <a
          href="/api/billing/portal"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-3 h-9 w-full border-primary/30 bg-background/80 text-xs"
          )}
        >
          {t("manage")}
        </a>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-3.5">
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-primary/20 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-start gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{t("upgradeTitle")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t("upgradeHint")}
          </p>
        </div>
      </div>
      <Link
        href="/subscribe"
        className={cn(
          buttonVariants({ size: "sm" }),
          "relative mt-3 h-9 w-full text-xs font-semibold shadow-sm"
        )}
      >
        {t("upgradeCta")}
      </Link>
    </div>
  );
}
