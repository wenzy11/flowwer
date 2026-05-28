import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/quotes/calculate";
import type { Quote } from "@/lib/db/quotes";
import { StatusBadge } from "@/components/quotes/status-badge";
import { cn } from "@/lib/utils";

type RecentQuotesProps = {
  quotes: (Quote & { clientName: string })[];
  locale: string;
};

export async function RecentQuotes({ quotes, locale }: RecentQuotesProps) {
  const t = await getTranslations("dashboard.recentQuotes");

  if (quotes.length === 0) return null;

  return (
    <section className="qf-card overflow-hidden">
      <div className="flex flex-row items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">{t("title")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Link
          href="/quotes"
          className="shrink-0 text-sm font-semibold text-primary hover:underline"
        >
          {t("viewAll")}
        </Link>
      </div>
      <div className="divide-y divide-border/60 p-2">
        {quotes.map((quote) => (
          <Link
            key={quote.id}
            href={`/quotes/${quote.id}`}
            className={cn(
              "flex min-h-[4rem] items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors",
              "hover:bg-muted/50"
            )}
          >
            <div className="min-w-0">
              <p className="font-semibold">{quote.quoteNumber}</p>
              <p className="truncate text-sm text-muted-foreground">
                {quote.clientName}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
              <StatusBadge status={quote.status} />
              <span className="text-sm font-bold tabular-nums sm:text-base">
                {formatMoney(quote.total, locale)}
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
