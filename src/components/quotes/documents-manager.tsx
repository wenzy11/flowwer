"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  CheckCircle,
  Copy,
  Download,
  Eye,
  FileInput,
  Search,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  convertToInvoiceAction,
  deleteQuoteAction,
  duplicateQuoteAction,
  updateQuoteStatusAction,
} from "@/lib/actions/quotes";
import type { QuoteStatus } from "@/lib/db/quotes";
import { formatMoney } from "@/lib/quotes/calculate";
import { Link } from "@/i18n/navigation";
import { StatusBadge } from "@/components/quotes/status-badge";
import { InfoBanner } from "@/components/ui/info-banner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DocumentListItem = {
  id: string;
  quoteNumber: string;
  clientName: string;
  status: QuoteStatus;
  total: number;
  createdAt: string;
  linkedInvoiceId?: string;
};

type DocumentsManagerProps = {
  documents: DocumentListItem[];
  mode: "estimate" | "invoice";
};

export function DocumentsManager({ documents, mode }: DocumentsManagerProps) {
  const ns = mode === "estimate" ? "quotes" : "invoices";
  const t = useTranslations(ns);
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesSearch =
        !q ||
        doc.quoteNumber.toLowerCase().includes(q) ||
        doc.clientName.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [documents, search, statusFilter]);

  function updateStatus(id: string, status: QuoteStatus) {
    startTransition(async () => {
      await updateQuoteStatusAction(id, status, locale);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      await deleteQuoteAction(id, locale);
      router.refresh();
    });
  }

  function handleDuplicate(id: string) {
    startTransition(async () => {
      const result = await duplicateQuoteAction(id, locale);
      if (result.success) {
        const path =
          mode === "estimate" ? `/quotes/${result.quoteId}` : `/invoices/${result.quoteId}`;
        router.push(path);
      }
    });
  }

  function handleConvert(id: string) {
    startTransition(async () => {
      const result = await convertToInvoiceAction(id, locale);
      if (result.success) {
        router.push(`/invoices/${result.invoiceId}`);
      }
    });
  }

  const detailBase = mode === "estimate" ? "/quotes" : "/invoices";
  const createHref = "/quote-builder";

  if (documents.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-primary/5 px-6 py-14 text-center">
        <p className="text-sm font-medium">{t("emptyTitle")}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {t("emptyDescription")}
        </p>
        {mode === "estimate" ? (
          <Link
            href={createHref}
            className="mt-4 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            {t("newQuote")}
          </Link>
        ) : (
          <Link
            href="/quotes"
            className="mt-4 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            {t("goToEstimates")}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InfoBanner
        title={t("listBannerTitle")}
        description={t("listBannerDescription")}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm sm:w-44"
          aria-label={t("filterStatus")}
        >
          <option value="all">{t("filterAll")}</option>
          <option value="draft">{t("status.draft")}</option>
          <option value="sent">{t("status.sent")}</option>
          <option value="approved">{t("status.approved")}</option>
          <option value="declined">{t("status.declined")}</option>
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("resultsCount", { count: filtered.length, total: documents.length })}
      </p>

      <div className="qf-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("number")}</TableHead>
              <TableHead>{t("client")}</TableHead>
              <TableHead>{t("statusLabel")}</TableHead>
              <TableHead className="text-right">{t("total")}</TableHead>
              <TableHead className="w-[220px] text-right">
                {tCommon("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`${detailBase}/${doc.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {doc.quoteNumber}
                  </Link>
                </TableCell>
                <TableCell>{doc.clientName}</TableCell>
                <TableCell>
                  <StatusBadge status={doc.status} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(doc.total, locale)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`${detailBase}/${doc.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" })
                      )}
                      aria-label={tCommon("view")}
                    >
                      <Eye className="size-4" />
                    </Link>
                    <a
                      href={`/api/quotes/${doc.id}/pdf?locale=${locale}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted"
                      aria-label={t("downloadPdf")}
                    >
                      <Download className="size-4" />
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      onClick={() => handleDuplicate(doc.id)}
                      aria-label={t("duplicate")}
                    >
                      <Copy className="size-4" />
                    </Button>
                    {mode === "estimate" &&
                    doc.status === "approved" &&
                    !doc.linkedInvoiceId ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={pending}
                        onClick={() => handleConvert(doc.id)}
                        aria-label={t("convertToInvoice")}
                      >
                        <FileInput className="size-4 text-primary" />
                      </Button>
                    ) : null}
                    {doc.status === "draft" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={pending}
                        onClick={() => updateStatus(doc.id, "sent")}
                        aria-label={t("markSent")}
                      >
                        <Send className="size-4" />
                      </Button>
                    ) : null}
                    {doc.status === "sent" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={pending}
                          onClick={() => updateStatus(doc.id, "approved")}
                          aria-label={t("markApproved")}
                        >
                          <CheckCircle className="size-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={pending}
                          onClick={() => updateStatus(doc.id, "declined")}
                          aria-label={t("markDeclined")}
                        >
                          <XCircle className="size-4 text-destructive" />
                        </Button>
                      </>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      onClick={() => handleDelete(doc.id)}
                      aria-label={tCommon("delete")}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t("noResults")}
        </p>
      ) : null}
    </div>
  );
}
