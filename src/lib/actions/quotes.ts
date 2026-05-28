"use server";

import { revalidatePath } from "next/cache";

import {
  convertEstimateToInvoice,
  createQuote,
  deleteQuote,
  duplicateQuote,
  updateQuoteStatus,
  type QuoteStatus,
} from "@/lib/db/quotes";
import { quoteDraftSchema } from "@/lib/validations";
import { requireUserId } from "@/lib/auth/user";

const APP_PATHS = [
  "/dashboard",
  "/quote-builder",
  "/quotes",
  "/invoices",
  "/reports",
];

function revalidateAll(locale?: string) {
  if (locale) {
    APP_PATHS.forEach((p) => revalidatePath(`/${locale}${p}`));
  } else {
    APP_PATHS.forEach((p) => revalidatePath(p, "layout"));
  }
}

export async function createQuoteAction(
  payload: unknown,
  locale?: string,
  documentType: "estimate" | "invoice" = "estimate"
) {
  const parsed = quoteDraftSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false as const, error: "validation" };
  }

  try {
    const userId = await requireUserId();
    const quote = await createQuote(parsed.data, userId, documentType);
    revalidateAll(locale);
    return { success: true as const, quoteId: quote.id };
  } catch {
    return { success: false as const, error: "failed" };
  }
}

export async function createInvoiceAction(payload: unknown, locale?: string) {
  return createQuoteAction(payload, locale, "invoice");
}

export async function updateQuoteStatusAction(
  quoteId: string,
  status: QuoteStatus,
  locale?: string
) {
  const userId = await requireUserId();
  const updated = await updateQuoteStatus(quoteId, status, userId);
  if (!updated) return { success: false as const, error: "not_found" };
  revalidateAll(locale);
  return { success: true as const };
}

export async function deleteQuoteAction(quoteId: string, locale?: string) {
  const userId = await requireUserId();
  const deleted = await deleteQuote(quoteId, userId);
  if (!deleted) return { success: false as const, error: "not_found" };
  revalidateAll(locale);
  return { success: true as const };
}

export async function duplicateQuoteAction(quoteId: string, locale?: string) {
  try {
    const userId = await requireUserId();
    const quote = await duplicateQuote(quoteId, userId);
    if (!quote) return { success: false as const, error: "not_found" };
    revalidateAll(locale);
    return { success: true as const, quoteId: quote.id };
  } catch {
    return { success: false as const, error: "failed" };
  }
}

export async function convertToInvoiceAction(
  estimateId: string,
  locale?: string
) {
  try {
    const userId = await requireUserId();
    const invoice = await convertEstimateToInvoice(estimateId, userId);
    if (!invoice) return { success: false as const, error: "not_found" };
    revalidateAll(locale);
    return { success: true as const, invoiceId: invoice.id };
  } catch {
    return { success: false as const, error: "failed" };
  }
}
