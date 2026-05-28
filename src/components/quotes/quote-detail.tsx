"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import {
  ArrowLeft,
  Copy,
  Download,
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle,
  XCircle,
  Trash2,
  FileInput,
  Eye,
} from "lucide-react";

import {
  convertToInvoiceAction,
  deleteQuoteAction,
  duplicateQuoteAction,
  updateQuoteStatusAction,
} from "@/lib/actions/quotes";
import type { QuoteWithDetails } from "@/lib/db/quotes";
import { formatMoney } from "@/lib/quotes/calculate";
import { Link, useRouter } from "@/i18n/navigation";
import { ShareLinkButton } from "@/components/quotes/share-link-button";
import { StatusBadge } from "@/components/quotes/status-badge";
import { InfoBanner } from "@/components/ui/info-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type QuoteDetailProps = {
  quote: QuoteWithDetails;
  backHref: "/quotes" | "/invoices";
  linkedInvoiceId?: string;
  linkedInvoiceNumber?: string;
  sourceEstimateId?: string;
  sourceEstimateNumber?: string;
};

export function QuoteDetail({
  quote,
  backHref,
  linkedInvoiceId,
  linkedInvoiceNumber,
  sourceEstimateId,
  sourceEstimateNumber,
}: QuoteDetailProps) {
  const t = useTranslations("quoteDetail");
  const tQuotes = useTranslations("quotes");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const pdfUrl = `/api/quotes/${quote.id}/pdf?locale=${locale}`;
  const isEstimate = quote.documentType === "estimate";
  const detailBase = isEstimate ? "/quotes" : "/invoices";
  const backLabel =
    backHref === "/invoices" ? t("backToInvoices") : t("backToQuotes");

  function setStatus(status: "sent" | "approved" | "declined") {
    startTransition(async () => {
      await updateQuoteStatusAction(quote.id, status, locale);
      router.refresh();
    });
  }

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateQuoteAction(quote.id, locale);
      if (result.success) {
        router.push(
          `${detailBase}/${result.quoteId}` as "/quotes/[id]" | "/invoices/[id]"
        );
      }
    });
  }

  function handleDelete() {
    if (!confirm(tQuotes("confirmDelete"))) return;
    startTransition(async () => {
      await deleteQuoteAction(quote.id, locale);
      router.push(backHref);
    });
  }

  function handleConvert() {
    startTransition(async () => {
      const result = await convertToInvoiceAction(quote.id, locale);
      if (result.success) {
        router.push(`/invoices/${result.invoiceId}`);
      }
    });
  }

  const showConvert =
    isEstimate &&
    quote.status === "approved" &&
    !linkedInvoiceId;

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>

      {linkedInvoiceId ? (
        <InfoBanner
          title={t("invoiceExistsTitle")}
          description={t("invoiceExistsDescription", {
            number: linkedInvoiceNumber ?? "",
          })}
        />
      ) : null}

      {sourceEstimateId ? (
        <p className="text-sm text-muted-foreground">
          {t("fromEstimate")}{" "}
          <Link
            href={`/quotes/${sourceEstimateId}`}
            className="font-semibold text-primary hover:underline"
          >
            {sourceEstimateNumber}
          </Link>
        </p>
      ) : null}

      {quote.viewedAt ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="size-3.5" />
          {t("viewedAt", {
            date: new Date(quote.viewedAt).toLocaleString(locale),
          })}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {quote.quoteNumber}
            </h1>
            <StatusBadge status={quote.status} />
          </div>
          <p className="mt-1 text-muted-foreground">
            {t("created")}{" "}
            {new Date(quote.createdAt).toLocaleDateString(locale, {
              dateStyle: "medium",
            })}
            {quote.validUntil
              ? ` · ${t("validUntil")} ${quote.validUntil}`
              : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm"
          >
            <Download className="size-4" />
            {tQuotes("downloadPdf")}
          </a>
          {isEstimate ? (
            <ShareLinkButton publicToken={quote.publicToken} />
          ) : null}
          {linkedInvoiceId ? (
            <Link
              href={`/invoices/${linkedInvoiceId}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium"
            >
              <FileInput className="size-4" />
              {t("openInvoice")}
            </Link>
          ) : null}
          <Button
            variant="outline"
            className="h-10"
            onClick={handleDuplicate}
            disabled={pending}
          >
            <Copy data-icon="inline-start" />
            {t("duplicate")}
          </Button>
          {showConvert ? (
            <Button
              className="h-10 shadow-sm"
              onClick={handleConvert}
              disabled={pending}
            >
              <FileInput data-icon="inline-start" />
              {tQuotes("convertToInvoice")}
            </Button>
          ) : null}
        </div>
      </div>

      <InfoBanner
        title={t(`statusHelp.${quote.status}.title`)}
        description={t(`statusHelp.${quote.status}.description`)}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{t("clientInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{quote.clientName}</p>
            {quote.clientEmail ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-3.5" />
                {quote.clientEmail}
              </p>
            ) : null}
            {quote.clientPhone ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5" />
                {quote.clientPhone}
              </p>
            ) : null}
            {quote.clientAddress ? (
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                {quote.clientAddress}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("lineItems")}</CardTitle>
            <CardDescription>{t("lineItemsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {quote.lineItems.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit} ×{" "}
                      {formatMoney(item.unitCost, locale)}
                    </p>
                  </div>
                  <p className="font-medium shrink-0">
                    {formatMoney(item.lineTotal, locale)}
                  </p>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span>{formatMoney(quote.subtotal, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("markup")} ({quote.markupPercent}%)
                </span>
                <span>{formatMoney(quote.markupAmount, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("tax")} ({quote.taxPercent}%)
                </span>
                <span>{formatMoney(quote.taxAmount, locale)}</span>
              </div>
              {quote.depositPercent > 0 ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("deposit")} ({quote.depositPercent}%)
                  </span>
                  <span>{formatMoney(quote.depositAmount, locale)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span>{t("total")}</span>
                <span>{formatMoney(quote.total, locale)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {quote.personalMessage ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("personalMessage")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {quote.personalMessage}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {quote.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("termsNotes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {quote.notes}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("actionsTitle")}</CardTitle>
          <CardDescription>{t("actionsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {quote.status === "draft" ? (
            <Button
              className="h-10 shadow-sm"
              onClick={() => setStatus("sent")}
              disabled={pending}
            >
              <Send data-icon="inline-start" />
              {tQuotes("markSent")}
            </Button>
          ) : null}
          {isEstimate && quote.status === "sent" ? (
            <>
              <Button
                className="h-10 shadow-sm"
                onClick={() => setStatus("approved")}
                disabled={pending}
              >
                <CheckCircle data-icon="inline-start" />
                {tQuotes("markApproved")}
              </Button>
              <Button
                variant="outline"
                className="h-10"
                onClick={() => setStatus("declined")}
                disabled={pending}
              >
                <XCircle data-icon="inline-start" />
                {t("markDeclined")}
              </Button>
            </>
          ) : null}
          <Button
            variant="destructive"
            className="h-10"
            onClick={handleDelete}
            disabled={pending}
          >
            <Trash2 data-icon="inline-start" />
            {tCommon("delete")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
