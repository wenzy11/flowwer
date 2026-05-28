"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useEffect, useState, useTransition } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Trash2,
} from "lucide-react";

import {
  createInvoiceAction,
  createQuoteAction,
  updateQuoteStatusAction,
} from "@/lib/actions/quotes";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/lib/db/quotes";
import type { Client } from "@/lib/db/clients";
import type { Material } from "@/lib/db/materials";
import {
  calculateLineTotal,
  calculateQuoteTotals,
  formatMoney,
} from "@/lib/quotes/calculate";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { InfoBanner } from "@/components/ui/info-banner";
import { FieldHint } from "@/components/ui/field-hint";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type LineItemDraft = {
  key: string;
  materialId?: string;
  name: string;
  unit: string;
  quantity: number;
  unitCost: number;
};

type QuoteBuilderWizardProps = {
  clients: Client[];
  materials: Material[];
  defaultMarkup: number;
  defaultTax: number;
  defaultDepositPercent: number;
  defaultTerms: string;
  currency: string;
  documentType?: DocumentType;
};

function defaultValidUntilDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0] ?? "";
}

function newLineItem(material?: Material): LineItemDraft {
  return {
    key: crypto.randomUUID(),
    materialId: material?.id,
    name: material?.name ?? "",
    unit: material?.unit ?? "",
    quantity: 1,
    unitCost: material?.unitCost ?? 0,
  };
}

export function QuoteBuilderWizard({
  clients,
  materials,
  defaultMarkup,
  defaultTax,
  defaultDepositPercent,
  defaultTerms,
  currency,
  documentType = "estimate",
}: QuoteBuilderWizardProps) {
  const t = useTranslations("quoteBuilder");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [clientId, setClientId] = useState("");
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([
    newLineItem(),
  ]);
  const [markupPercent, setMarkupPercent] = useState(defaultMarkup);
  const [taxPercent, setTaxPercent] = useState(defaultTax);
  const [depositPercent, setDepositPercent] = useState(defaultDepositPercent);
  const [notes, setNotes] = useState(defaultTerms);
  const [personalMessage, setPersonalMessage] = useState("");
  const [validUntil, setValidUntil] = useState(defaultValidUntilDate);
  const [error, setError] = useState<string | null>(null);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const draftKey = `quoteflow-draft-${documentType}`;

  const totals = useMemo(() => {
    const lineTotals = lineItems.map((item) =>
      calculateLineTotal(item.quantity, item.unitCost)
    );
    return calculateQuoteTotals({
      lineTotals,
      markupPercent,
      taxPercent,
    });
  }, [lineItems, markupPercent, taxPercent]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        clientId?: string;
        lineItems?: LineItemDraft[];
        markupPercent?: number;
        taxPercent?: number;
        depositPercent?: number;
        notes?: string;
        personalMessage?: string;
        validUntil?: string;
      };
      if (draft.clientId) setClientId(draft.clientId);
      if (draft.lineItems?.length) setLineItems(draft.lineItems);
      if (draft.markupPercent != null) setMarkupPercent(draft.markupPercent);
      if (draft.taxPercent != null) setTaxPercent(draft.taxPercent);
      if (draft.depositPercent != null) setDepositPercent(draft.depositPercent);
      if (draft.notes != null) setNotes(draft.notes);
      if (draft.personalMessage != null) setPersonalMessage(draft.personalMessage);
      if (draft.validUntil) setValidUntil(draft.validUntil);
    } catch {
      /* ignore */
    }
  }, [draftKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          clientId,
          lineItems,
          markupPercent,
          taxPercent,
          depositPercent,
          notes,
          personalMessage,
          validUntil,
        })
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [
    clientId,
    lineItems,
    markupPercent,
    taxPercent,
    depositPercent,
    notes,
    personalMessage,
    validUntil,
    draftKey,
  ]);

  const selectedClient = clients.find((c) => c.id === clientId);
  const canGoStep2 = Boolean(clientId);
  const canGoStep3 = lineItems.some(
    (item) => item.name.trim() && item.quantity > 0
  );

  function addFromCatalog(materialId: string) {
    const material = materials.find((m) => m.id === materialId);
    if (!material) return;
    setLineItems((items) => [...items, newLineItem(material)]);
  }

  function updateLineItem(
    key: string,
    field: keyof LineItemDraft,
    value: string | number
  ) {
    setLineItems((items) =>
      items.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  }

  function removeLineItem(key: string) {
    setLineItems((items) =>
      items.length > 1 ? items.filter((i) => i.key !== key) : items
    );
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const payload = {
        clientId,
        markupPercent,
        taxPercent,
        depositPercent,
        notes,
        personalMessage,
        validUntil: validUntil || undefined,
        lineItems: lineItems
          .filter((item) => item.name.trim())
          .map((item) => ({
            materialId: item.materialId,
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
      };

      const result =
        documentType === "invoice"
          ? await createInvoiceAction(payload, locale)
          : await createQuoteAction(payload, locale);

      if (!result.success) {
        setError(t("saveError"));
        return;
      }
      localStorage.removeItem(draftKey);
      setSavedQuoteId(result.quoteId);
      setStep(4);
    });
  }

  const pdfUrl = savedQuoteId
    ? `/api/quotes/${savedQuoteId}/pdf?locale=${locale}`
    : null;

  return (
    <div className="space-y-6">
      <InfoBanner
        variant="hero"
        title={t("bannerTitle")}
        description={t("bannerDescription")}
      />

      <div className="qf-card p-3">
        <div className="flex gap-1 overflow-x-auto pb-0.5">
          {[1, 2, 3, 4].map((s) => {
            const isCurrent = step === s;
            const isDone = step > s;
            const canNavigate = s < 4 || savedQuoteId;
            return (
              <button
                key={s}
                type="button"
                disabled={!canNavigate && s === 4}
                onClick={() => (canNavigate ? setStep(s) : undefined)}
                className={cn(
                  "flex min-h-12 shrink-0 flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold transition-all sm:min-w-[7rem] sm:text-sm",
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isDone
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isCurrent
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : isDone
                        ? "bg-primary text-primary-foreground"
                        : "border border-current"
                  )}
                >
                  {isDone ? <Check className="size-3.5" /> : s}
                </span>
                <span className="hidden truncate sm:inline">
                  {t(`steps.${s}.title`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("steps.1.title")}</CardTitle>
            <CardDescription>{t("steps.1.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldHint
              label={t("selectClient")}
              hint={t("hints.selectClient")}
            >
              <Select
                value={clientId}
                onValueChange={(v) => setClientId(String(v ?? ""))}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder={t("selectClientPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldHint>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => setClientDialogOpen(true)}
            >
              <Plus data-icon="inline-start" />
              {t("addNewClient")}
            </Button>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noClients")}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("steps.2.title")}</CardTitle>
            <CardDescription>{t("steps.2.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {materials.length > 0 ? (
              <div className="space-y-2">
                <Label>{t("addFromCatalog")}</Label>
                <Select
                  onValueChange={(v) => {
                    const id = String(v ?? "");
                    if (id) addFromCatalog(id);
                  }}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder={t("catalogPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} — {formatMoney(m.unitCost, locale, currency)}/{m.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-3">
              {lineItems.map((item) => (
                <div
                  key={item.key}
                  className="rounded-lg border border-border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs text-muted-foreground">
                      {t("lineItem")}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeLineItem(item.key)}
                      aria-label={tCommon("delete")}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      updateLineItem(item.key, "name", e.target.value)
                    }
                    placeholder={t("itemName")}
                    className="h-11"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={item.unit}
                      onChange={(e) =>
                        updateLineItem(item.key, "unit", e.target.value)
                      }
                      placeholder={t("unit")}
                      className="h-11"
                    />
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(
                          item.key,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-11"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) =>
                        updateLineItem(
                          item.key,
                          "unitCost",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-11"
                    />
                  </div>
                  <p className="text-right text-sm font-medium">
                    {formatMoney(
                      calculateLineTotal(item.quantity, item.unitCost),
                      locale,
                      currency
                    )}
                  </p>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => setLineItems((items) => [...items, newLineItem()])}
            >
              <Plus data-icon="inline-start" />
              {t("addCustomLine")}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("steps.3.title")}</CardTitle>
            <CardDescription>{t("steps.3.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClient ? (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <span className="text-muted-foreground">{t("client")}: </span>
                <span className="font-medium">{selectedClient.name}</span>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <FieldHint
                htmlFor="markup"
                label={t("markupPercent")}
                hint={t("hints.markup")}
              >
                <Input
                  id="markup"
                  type="number"
                  min="0"
                  max="1000"
                  value={markupPercent}
                  onChange={(e) =>
                    setMarkupPercent(parseFloat(e.target.value) || 0)
                  }
                  className="h-11"
                />
              </FieldHint>
              <FieldHint
                htmlFor="tax"
                label={t("taxPercent")}
                hint={t("hints.tax")}
              >
                <Input
                  id="tax"
                  type="number"
                  min="0"
                  max="100"
                  value={taxPercent}
                  onChange={(e) =>
                    setTaxPercent(parseFloat(e.target.value) || 0)
                  }
                  className="h-11"
                />
              </FieldHint>
              <FieldHint
                htmlFor="deposit"
                label={t("depositPercent")}
                hint={t("hints.deposit")}
              >
                <Input
                  id="deposit"
                  type="number"
                  min="0"
                  max="100"
                  value={depositPercent}
                  onChange={(e) =>
                    setDepositPercent(parseFloat(e.target.value) || 0)
                  }
                  className="h-11"
                />
              </FieldHint>
            </div>
            <FieldHint
              htmlFor="personalMessage"
              label={t("personalMessage")}
              hint={t("hints.personalMessage")}
            >
              <Textarea
                id="personalMessage"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                rows={3}
                placeholder={t("personalMessagePlaceholder")}
              />
            </FieldHint>
            <FieldHint
              htmlFor="validUntil"
              label={t("validUntil")}
              hint={t("hints.validUntil")}
            >
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="h-11"
              />
            </FieldHint>
            <FieldHint
              htmlFor="notes"
              label={t("notes")}
              hint={t("hints.notes")}
            >
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("notesPlaceholder")}
                rows={4}
              />
            </FieldHint>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t("subtotal")}</span>
                <span>{formatMoney(totals.subtotal, locale, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {t("markup")} ({markupPercent}%)
                </span>
                <span>{formatMoney(totals.markupAmount, locale, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {t("tax")} ({taxPercent}%)
                </span>
                <span>{formatMoney(totals.taxAmount, locale, currency)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span>{t("total")}</span>
                <span>{formatMoney(totals.total, locale, currency)}</span>
              </div>
              <p className="pt-2 text-xs text-muted-foreground">
                {t("reviewHint")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="size-5 text-primary" />
              {t("successTitle")}
            </CardTitle>
            <CardDescription>{t("successDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClient ? (
              <p className="text-sm">
                <span className="text-muted-foreground">{t("client")}: </span>
                <span className="font-medium">{selectedClient.name}</span>
              </p>
            ) : null}
            <p className="text-2xl font-bold">
              {formatMoney(totals.total, locale, currency)}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {pdfUrl ? (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                >
                  <Download className="size-4" />
                  {t("downloadPdf")}
                </a>
              ) : null}
              {documentType === "estimate" && savedQuoteId ? (
                <Button
                  variant="outline"
                  className="h-11 flex-1"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      await updateQuoteStatusAction(
                        savedQuoteId,
                        "sent",
                        locale
                      );
                      router.refresh();
                    });
                  }}
                >
                  {t("markSent")}
                </Button>
              ) : null}
              <Button
                variant="outline"
                className="h-11 flex-1"
                onClick={() =>
                  router.push(
                    documentType === "invoice" ? "/invoices" : "/quotes"
                  )
                }
              >
                {documentType === "invoice"
                  ? t("viewInvoices")
                  : t("viewQuotes")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {step < 4 ? (
        <div className="flex gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1"
              onClick={() => setStep((s) => s - 1)}
            >
              <ChevronLeft data-icon="inline-start" />
              {tCommon("back")}
            </Button>
          ) : null}
          {step < 3 ? (
            <Button
              type="button"
              className="h-11 flex-1"
              disabled={step === 1 ? !canGoStep2 : !canGoStep3}
              onClick={() => setStep((s) => s + 1)}
            >
              {tCommon("next")}
              <ChevronRight data-icon="inline-end" />
            </Button>
          ) : (
            <Button
              type="button"
              className="h-11 flex-1"
              disabled={pending || !canGoStep3}
              onClick={handleSave}
            >
              {pending ? tCommon("saving") : t("saveQuote")}
            </Button>
          )}
        </div>
      ) : null}

      <ClientFormDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        locale={locale}
        onCreated={(id) => {
          setClientId(id);
          setClientDialogOpen(false);
        }}
      />
    </div>
  );
}
