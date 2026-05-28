import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

import {
  calculateLineTotal,
  calculateQuoteTotals,
} from "@/lib/quotes/calculate";
import type { QuoteDraftInput } from "@/lib/validations";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getClient } from "./clients";

export type QuoteStatus = "draft" | "sent" | "approved" | "declined";
export type DocumentType = "estimate" | "invoice";
export type PaymentStatus = "unpaid" | "partial" | "paid";

export type QuoteLineItem = {
  id: string;
  quoteId: string;
  materialId: string | null;
  name: string;
  unit: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  sortOrder: number;
};

export type Quote = {
  id: string;
  quoteNumber: string;
  userId: string;
  clientId: string;
  documentType: DocumentType;
  sourceEstimateId: string | null;
  status: QuoteStatus;
  markupPercent: number;
  taxPercent: number;
  depositPercent: number;
  depositAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  notes: string;
  personalMessage: string;
  validUntil: string | null;
  subtotal: number;
  markupAmount: number;
  taxAmount: number;
  total: number;
  sentAt: string | null;
  viewedAt: string | null;
  publicToken: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  note: string;
  paidAt: string;
};

export type QuoteWithDetails = Quote & {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  lineItems: QuoteLineItem[];
};

function mapQuoteRow(row: Record<string, unknown>): Quote {
  return {
    id: row.id as string,
    quoteNumber: row.quote_number as string,
    userId: (row.user_id as string) ?? "",
    clientId: row.client_id as string,
    documentType: ((row.document_type as string) ?? "estimate") as DocumentType,
    sourceEstimateId: (row.source_estimate_id as string) ?? null,
    status: row.status as QuoteStatus,
    markupPercent: row.markup_percent as number,
    taxPercent: row.tax_percent as number,
    depositPercent: (row.deposit_percent as number) ?? 0,
    depositAmount: (row.deposit_amount as number) ?? 0,
    amountPaid: (row.amount_paid as number) ?? 0,
    paymentStatus: ((row.payment_status as string) ?? "unpaid") as PaymentStatus,
    notes: (row.notes as string) ?? "",
    personalMessage: (row.personal_message as string) ?? "",
    validUntil: (row.valid_until as string) ?? null,
    subtotal: row.subtotal as number,
    markupAmount: row.markup_amount as number,
    taxAmount: row.tax_amount as number,
    total: row.total as number,
    sentAt: (row.sent_at as string) ?? null,
    viewedAt: (row.viewed_at as string) ?? null,
    publicToken: (row.public_token as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapLineItemRow(row: Record<string, unknown>): QuoteLineItem {
  return {
    id: row.id as string,
    quoteId: row.quote_id as string,
    materialId: (row.material_id as string) ?? null,
    name: row.name as string,
    unit: row.unit as string,
    quantity: row.quantity as number,
    unitCost: row.unit_cost as number,
    lineTotal: row.line_total as number,
    sortOrder: row.sort_order as number,
  };
}

function userDoc(userId: string) {
  return getAdminFirestore().collection("users").doc(userId);
}

function quotesCollection(userId: string) {
  return userDoc(userId).collection("quotes");
}

function createdAtMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "string") return Date.parse(value) || 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return Number((value as { seconds: number }).seconds) * 1000;
  }
  return 0;
}

function sortDocsByCreatedAtDesc<T extends { get: (field: string) => unknown }>(
  docs: T[]
): T[] {
  return [...docs].sort(
    (a, b) =>
      createdAtMillis(b.get("created_at")) - createdAtMillis(a.get("created_at"))
  );
}

function settingsDoc(userId: string) {
  return userDoc(userId).collection("company").doc("settings");
}

async function nextDocumentNumber(userId: string, type: DocumentType): Promise<string> {
  const year = new Date().getFullYear();
  const userPrefix =
    userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "USER";
  const prefix =
    type === "invoice"
      ? `${userPrefix}-INV-${year}-`
      : `${userPrefix}-EST-${year}-`;

  const snapshot = await quotesCollection(userId)
    .where("document_type", "==", type)
    .get();

  let maxSeq = 0;
  for (const doc of sortDocsByCreatedAtDesc(snapshot.docs).slice(0, 200)) {
    const quoteNumber = String(doc.get("quote_number") ?? "");
    if (!quoteNumber.startsWith(prefix)) continue;
    const seq = parseInt(quoteNumber.replace(prefix, ""), 10);
    if (!Number.isNaN(seq)) maxSeq = Math.max(maxSeq, seq);
  }
  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

function computeDeposit(total: number, depositPercent: number) {
  return Math.round(((total * depositPercent) / 100) * 100) / 100;
}

export async function listQuotes(
  userId: string,
  documentType?: DocumentType
): Promise<(Quote & { clientName: string })[]> {
  const snapshot = documentType
    ? await quotesCollection(userId)
        .where("document_type", "==", documentType)
        .get()
    : await quotesCollection(userId).orderBy("created_at", "desc").get();

  const docs = documentType
    ? sortDocsByCreatedAtDesc(snapshot.docs)
    : snapshot.docs;

  const out: (Quote & { clientName: string })[] = [];
  for (const doc of docs) {
    const data = doc.data() as Record<string, unknown>;
    const client = await getClient(String(data.client_id), userId);
    out.push({
      ...mapQuoteRow({ id: doc.id, ...data }),
      clientName: client?.name ?? "",
    });
  }
  return out;
}

export function listEstimates(userId: string) {
  return listQuotes(userId, "estimate");
}

export function listInvoices(userId: string) {
  return listQuotes(userId, "invoice");
}

export async function getQuoteWithDetails(
  id: string,
  userId: string
): Promise<QuoteWithDetails | null> {
  const doc = await quotesCollection(userId).doc(id).get();
  if (!doc.exists) return null;
  const row = doc.data() as Record<string, unknown>;
  const client = await getClient(String(row.client_id), userId);
  const lineItems = Array.isArray(row.line_items)
    ? (row.line_items as Record<string, unknown>[]).map(mapLineItemRow)
    : [];

  return {
    ...mapQuoteRow({ id: doc.id, ...row }),
    clientName: client?.name ?? "",
    clientEmail: client?.email ?? "",
    clientPhone: client?.phone ?? "",
    clientAddress: client?.address ?? "",
    lineItems,
  };
}

export function createQuote(
  input: QuoteDraftInput,
  userId: string,
  documentType: DocumentType = "estimate"
): Promise<QuoteWithDetails> {
  return createQuoteInternal(input, userId, documentType);
}

async function createQuoteInternal(
  input: QuoteDraftInput,
  userId: string,
  documentType: DocumentType
): Promise<QuoteWithDetails> {
  const client = await getClient(input.clientId, userId);
  if (!client) throw new Error("Client not found");

  const lineTotals = input.lineItems.map((item) =>
    calculateLineTotal(item.quantity, item.unitCost)
  );
  const totals = calculateQuoteTotals({
    lineTotals,
    markupPercent: input.markupPercent,
    taxPercent: input.taxPercent,
  });

  const depositPercent = input.depositPercent ?? 0;
  const depositAmount = computeDeposit(totals.total, depositPercent);

  const id = uuidv4();
  const publicToken = crypto.randomUUID().replace(/-/g, "");
  const quoteNumber = await nextDocumentNumber(userId, documentType);
  const now = new Date().toISOString();
  await quotesCollection(userId).doc(id).set({
    quote_number: quoteNumber,
    user_id: userId,
    client_id: input.clientId,
    document_type: documentType,
    source_estimate_id: null,
    public_token: publicToken,
    status: "draft",
    markup_percent: input.markupPercent,
    tax_percent: input.taxPercent,
    deposit_percent: depositPercent,
    deposit_amount: depositAmount,
    amount_paid: 0,
    payment_status: "unpaid",
    notes: input.notes ?? "",
    personal_message: input.personalMessage ?? "",
    valid_until: input.validUntil || null,
    subtotal: totals.subtotal,
    markup_amount: totals.markupAmount,
    tax_amount: totals.taxAmount,
    total: totals.total,
    line_items: input.lineItems.map((item, index) => ({
      id: uuidv4(),
      quote_id: id,
      material_id: item.materialId ?? null,
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      unit_cost: item.unitCost,
      line_total: lineTotals[index],
      sort_order: index,
    })),
    sent_at: null,
    viewed_at: null,
    created_at: now,
    updated_at: now,
  });
  return (await getQuoteWithDetails(id, userId))!;
}

export function findInvoiceForEstimate(
  estimateId: string,
  userId: string
): Promise<(Quote & { clientName: string }) | null> {
  return findInvoiceForEstimateInternal(estimateId, userId);
}

async function findInvoiceForEstimateInternal(
  estimateId: string,
  userId: string
): Promise<(Quote & { clientName: string }) | null> {
  const snapshot = await quotesCollection(userId)
    .where("document_type", "==", "invoice")
    .where("source_estimate_id", "==", estimateId)
    .get();
  const sorted = sortDocsByCreatedAtDesc(snapshot.docs);
  if (!sorted.length) return null;
  const doc = sorted[0]!;
  const row = doc.data() as Record<string, unknown>;
  const client = await getClient(String(row.client_id), userId);
  return {
    ...mapQuoteRow({ id: doc.id, ...row }),
    clientName: client?.name ?? "",
  };
}

export function getQuoteByPublicToken(
  token: string
): Promise<QuoteWithDetails | null> {
  return getQuoteByPublicTokenInternal(token);
}

async function getQuoteByPublicTokenInternal(
  token: string
): Promise<QuoteWithDetails | null> {
  const snapshot = await getAdminFirestore()
    .collectionGroup("quotes")
    .where("public_token", "==", token)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0]!;
  const row = doc.data() as Record<string, unknown>;
  const userId = String(row.user_id ?? "");
  const client = await getClient(String(row.client_id), userId);
  const lineItems = Array.isArray(row.line_items)
    ? (row.line_items as Record<string, unknown>[]).map(mapLineItemRow)
    : [];
  return {
    ...mapQuoteRow({ id: doc.id, ...row }),
    clientName: client?.name ?? "",
    clientEmail: client?.email ?? "",
    clientPhone: client?.phone ?? "",
    clientAddress: client?.address ?? "",
    lineItems,
  };
}

export function respondToEstimateByToken(
  token: string,
  decision: "approved" | "declined"
): Promise<Quote | null> {
  return respondToEstimateByTokenInternal(token, decision);
}

async function respondToEstimateByTokenInternal(
  token: string,
  decision: "approved" | "declined"
): Promise<Quote | null> {
  const snapshot = await getAdminFirestore()
    .collectionGroup("quotes")
    .where("public_token", "==", token)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0]!;
  const quote = doc.data() as Record<string, unknown>;
  if (!quote || quote.document_type !== "estimate") return null;
  if ((quote.status as QuoteStatus) !== "sent") return null;
  return updateQuoteStatus(doc.id, decision, String(quote.user_id));
}

export function convertEstimateToInvoice(
  estimateId: string,
  userId: string
): Promise<QuoteWithDetails | null> {
  return convertEstimateToInvoiceInternal(estimateId, userId);
}

async function convertEstimateToInvoiceInternal(
  estimateId: string,
  userId: string
): Promise<QuoteWithDetails | null> {
  const source = await getQuoteWithDetails(estimateId, userId);
  if (!source || source.documentType !== "estimate") return null;

  const existing = await findInvoiceForEstimate(userId ? estimateId : "", userId);
  if (existing) {
    return getQuoteWithDetails(existing.id, userId);
  }

  const invoice = await createQuoteInternal(
    {
      clientId: source.clientId,
      markupPercent: source.markupPercent,
      taxPercent: source.taxPercent,
      depositPercent: source.depositPercent,
      notes: source.notes,
      personalMessage: source.personalMessage,
      validUntil: source.validUntil ?? undefined,
      lineItems: source.lineItems.map((item) => ({
        materialId: item.materialId ?? undefined,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    },
    userId,
    "invoice"
  );

  await quotesCollection(userId).doc(invoice.id).update({
    source_estimate_id: estimateId,
  });

  if (source.status !== "approved") {
    await updateQuoteStatus(estimateId, "approved", userId);
  }

  return getQuoteWithDetails(invoice.id, userId);
}

export function updateQuoteStatus(
  id: string,
  status: QuoteStatus,
  userId: string
): Promise<Quote | null> {
  return updateQuoteStatusInternal(id, status, userId);
}

async function updateQuoteStatusInternal(
  id: string,
  status: QuoteStatus,
  userId: string
): Promise<Quote | null> {
  const ref = quotesCollection(userId).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;
  const now = new Date().toISOString();
  const base = {
    status,
    updated_at: now,
  };
  if (status === "sent") {
    const sentAt = (existing.get("sent_at") as string | null) ?? now;
    await ref.update({ ...base, sent_at: sentAt });
  } else {
    await ref.update(base);
  }

  const row = (await ref.get()).data() as Record<string, unknown>;
  return mapQuoteRow({ id, ...row });
}

export async function markDocumentViewed(id: string, userId: string): Promise<void> {
  const now = new Date().toISOString();
  const ref = quotesCollection(userId).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return;
  const viewedAt = (snap.get("viewed_at") as string | null) ?? now;
  await ref.update({
    viewed_at: viewedAt,
    updated_at: now,
  });
}

export async function duplicateQuote(
  id: string,
  userId: string
): Promise<QuoteWithDetails | null> {
  const source = await getQuoteWithDetails(id, userId);
  if (!source) return null;

  return createQuoteInternal(
    {
      clientId: source.clientId,
      markupPercent: source.markupPercent,
      taxPercent: source.taxPercent,
      depositPercent: source.depositPercent,
      notes: source.notes,
      personalMessage: source.personalMessage,
      validUntil: source.validUntil ?? undefined,
      lineItems: source.lineItems.map((item) => ({
        materialId: item.materialId ?? undefined,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    },
    userId,
    source.documentType
  );
}

export function listRecentQuotes(
  userId: string,
  limit = 5,
  documentType?: DocumentType
) {
  const listPromise = documentType
    ? listQuotes(userId, documentType)
    : listQuotes(userId);
  return listPromise.then((list) => list.slice(0, limit));
}

export async function deleteQuote(id: string, userId: string): Promise<boolean> {
  await quotesCollection(userId).doc(id).delete();
  return true;
}

export async function getDashboardStats(userId: string) {
  const [estimates, invoices, clients, materials] = await Promise.all([
    listEstimates(userId),
    listInvoices(userId),
    getAdminFirestore().collection("users").doc(userId).collection("clients").get(),
    getAdminFirestore().collection("users").doc(userId).collection("materials").get(),
  ]);

  return {
    quotesSent: estimates.filter((q) => q.status !== "draft").length,
    revenueApproved: estimates
      .filter((q) => q.status === "approved")
      .reduce((sum, q) => sum + q.total, 0),
    draftsCount: estimates.filter((q) => q.status === "draft").length,
    invoicesOutstanding: invoices.reduce((sum, q) => sum + (q.total - q.amountPaid), 0),
    paymentsCollected: invoices.reduce((sum, q) => sum + q.amountPaid, 0),
    invoicesCount: invoices.length,
    materialsCount: materials.size,
    clientsCount: clients.size,
  };
}

export async function getSalesReport(userId: string) {
  const all = await listQuotes(userId);
  const monthMap = new Map<string, { approved_estimates: number; collected: number }>();
  for (const row of all) {
    const month = row.createdAt.slice(0, 7);
    const current = monthMap.get(month) ?? { approved_estimates: 0, collected: 0 };
    if (row.documentType === "estimate" && row.status === "approved") {
      current.approved_estimates += row.total;
    }
    if (row.documentType === "invoice") {
      current.collected += row.amountPaid;
    }
    monthMap.set(month, current);
  }
  const byMonth = [...monthMap.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12)
    .map(([month, value]) => ({ month, ...value }));

  const totals = {
    total_estimates: all.filter((q) => q.documentType === "estimate").length,
    total_invoices: all.filter((q) => q.documentType === "invoice").length,
    approved_value: all
      .filter((q) => q.documentType === "estimate" && q.status === "approved")
      .reduce((sum, q) => sum + q.total, 0),
    total_collected: all
      .filter((q) => q.documentType === "invoice")
      .reduce((sum, q) => sum + q.amountPaid, 0),
  };

  return { byMonth, totals };
}

function ensureCompanySettings(userId: string) {
  return settingsDoc(userId).set(
    {
      company_name: "QuoteFlow",
      email: "",
      phone: "",
      address: "",
      tax_id: "",
      tax_office: "",
      default_markup: 20,
      default_tax: 0,
      currency: "USD",
      default_terms: "",
      logo_url: "",
      license_number: "",
      insurance_info: "",
      default_deposit_percent: 0,
      payments_enabled: false,
    },
    { merge: true }
  );
}

export async function getCompanySettings(
  userId: string
): Promise<import("./types").CompanySettings> {
  await ensureCompanySettings(userId);
  const row = (await settingsDoc(userId).get()).data() as Record<string, unknown>;
  return {
    companyName: row.company_name as string,
    email: (row.email as string) ?? "",
    phone: (row.phone as string) ?? "",
    address: (row.address as string) ?? "",
    taxId: (row.tax_id as string) ?? "",
    taxOffice: (row.tax_office as string) ?? "",
    defaultMarkup: row.default_markup as number,
    defaultTax: row.default_tax as number,
    currency: row.currency as string,
    defaultTerms: (row.default_terms as string) ?? "",
    logoUrl: (row.logo_url as string) ?? "",
    licenseNumber: (row.license_number as string) ?? "",
    insuranceInfo: (row.insurance_info as string) ?? "",
    defaultDepositPercent: (row.default_deposit_percent as number) ?? 0,
    paymentsEnabled: Boolean(row.payments_enabled),
  };
}

export function updateCompanySettings(
  input: import("./types").CompanySettingsInput,
  userId: string
) {
  return updateCompanySettingsInternal(input, userId);
}

async function updateCompanySettingsInternal(
  input: import("./types").CompanySettingsInput,
  userId: string
) {
  await ensureCompanySettings(userId);
  await settingsDoc(userId).set(
    {
      company_name: input.companyName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      tax_id: input.taxId,
      tax_office: input.taxOffice,
      default_markup: input.defaultMarkup,
      default_tax: input.defaultTax,
      currency: input.currency,
      default_terms: input.defaultTerms,
      logo_url: input.logoUrl,
      license_number: input.licenseNumber,
      insurance_info: input.insuranceInfo,
      default_deposit_percent: input.defaultDepositPercent,
      payments_enabled: input.paymentsEnabled,
    },
    { merge: true }
  );
  return getCompanySettings(userId);
}
