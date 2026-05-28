"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle, XCircle, FileText } from "lucide-react";

import { clientRespondAction } from "@/lib/actions/public";
import type { QuoteWithDetails } from "@/lib/db/quotes";
import { formatMoney } from "@/lib/quotes/calculate";
import { StatusBadge } from "@/components/quotes/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ClientPortalProps = {
  quote: QuoteWithDetails;
  companyName: string;
};

export function ClientPortal({ quote, companyName }: ClientPortalProps) {
  const t = useTranslations("clientPortal");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const canRespond = quote.status === "sent" && quote.documentType === "estimate";

  function respond(decision: "approved" | "declined") {
    startTransition(async () => {
      await clientRespondAction(quote.publicToken, decision, locale);
      window.location.reload();
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8 px-4">
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <FileText className="size-6" />
        </div>
        <h1 className="text-xl font-bold">{companyName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="qf-card-elevated">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>{quote.quoteNumber}</CardTitle>
              <CardDescription>{quote.clientName}</CardDescription>
            </div>
            <StatusBadge status={quote.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {quote.personalMessage ? (
            <p className="rounded-lg bg-primary/5 px-3 py-2 text-sm italic text-muted-foreground">
              {quote.personalMessage}
            </p>
          ) : null}

          <ul className="space-y-2 text-sm">
            {quote.lineItems.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span>
                  {item.name}{" "}
                  <span className="text-muted-foreground">
                    ({item.quantity} {item.unit})
                  </span>
                </span>
                <span className="font-medium tabular-nums">
                  {formatMoney(item.lineTotal, locale)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-3 text-right">
            <p className="text-2xl font-bold tabular-nums">
              {formatMoney(quote.total, locale)}
            </p>
            {quote.depositPercent > 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("deposit", {
                  percent: quote.depositPercent,
                  amount: formatMoney(quote.depositAmount, locale),
                })}
              </p>
            ) : null}
          </div>

          {canRespond ? (
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button
                className="h-11 flex-1 shadow-sm"
                disabled={pending}
                onClick={() => respond("approved")}
              >
                <CheckCircle data-icon="inline-start" />
                {t("approve")}
              </Button>
              <Button
                variant="outline"
                className="h-11 flex-1"
                disabled={pending}
                onClick={() => respond("declined")}
              >
                <XCircle data-icon="inline-start" />
                {t("decline")}
              </Button>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              {quote.status === "approved"
                ? t("alreadyApproved")
                : quote.status === "declined"
                  ? t("alreadyDeclined")
                  : t("notReady")}
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">{t("poweredBy")}</p>
    </div>
  );
}
