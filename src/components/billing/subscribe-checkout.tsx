"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";

import { PRO_PLAN, type BillingInterval } from "@/lib/billing/plans";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubscribeCheckoutProps = {
  locale: string;
  polarReady: boolean;
  defaultInterval?: BillingInterval;
};

export function SubscribeCheckout({
  locale,
  polarReady,
  defaultInterval = "year",
}: SubscribeCheckoutProps) {
  const t = useTranslations("billing");
  const [interval, setInterval] = useState<BillingInterval>(defaultInterval);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (!polarReady) {
      setError(t("polarNotConfigured"));
      return;
    }
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval, locale }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "checkout_failed");
      }
      window.location.href = data.url;
    } catch {
      setError(t("checkoutError"));
      setPending(false);
    }
  }

  const monthly = PRO_PLAN.monthly;
  const yearly = PRO_PLAN.yearly;
  const perMonthYearly = (yearly.amount / 12).toFixed(2);

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-border/80 bg-card/80 p-1 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setInterval("month")}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-all",
              interval === "month"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("monthly")}
          </button>
          <button
            type="button"
            onClick={() => setInterval("year")}
            className={cn(
              "relative rounded-full px-5 py-2 text-sm font-medium transition-all",
              interval === "year"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("yearly")}
            <span className="absolute -right-1 -top-2 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              -{yearly.savingsPercent}%
            </span>
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-card/90 p-8 shadow-[0_24px_80px_-24px_oklch(0.45_0.12_166_/_0.35)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {t("proBadge")}
              </p>
              <h2 className="text-2xl font-bold tracking-tight">{t("proTitle")}</h2>
            </div>
          </div>

          <div className="mt-8 flex items-end gap-2">
            <span className="text-5xl font-bold tracking-tight">
              {interval === "month" ? monthly.label : yearly.label}
            </span>
            <span className="pb-2 text-muted-foreground">
              /{interval === "month" ? t("perMonth") : t("perYear")}
            </span>
          </div>
          {interval === "year" ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {t("yearlyEquiv", { price: `$${perMonthYearly}` })}
            </p>
          ) : null}

          <ul className="mt-8 space-y-3">
            {(["f1", "f2", "f3", "f4", "f5"] as const).map((key) => (
              <li key={key} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  ✓
                </span>
                <span>{t(`features.${key}`)}</span>
              </li>
            ))}
          </ul>

          {error ? (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            size="lg"
            className="mt-8 h-12 w-full text-base font-semibold shadow-md"
            disabled={pending}
            onClick={startCheckout}
          >
            {pending ? (
              <>
                <Loader2 className="size-5 animate-spin" data-icon="inline-start" />
                {t("redirecting")}
              </>
            ) : (
              t("cta")
            )}
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t("secureNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
