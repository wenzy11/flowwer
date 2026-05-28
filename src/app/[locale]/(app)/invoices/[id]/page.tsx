import { notFound } from "next/navigation";

import { QuoteDetail } from "@/components/quotes/quote-detail";
import { requireUserId } from "@/lib/auth/user";
import { ensureDbReady } from "@/lib/init-db";
import {
  getQuoteWithDetails,
} from "@/lib/db/quotes";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  ensureDbReady();
  const quote = await getQuoteWithDetails(id, userId);
  if (!quote || quote.documentType !== "invoice") notFound();

  const sourceEstimate = quote.sourceEstimateId
    ? await getQuoteWithDetails(quote.sourceEstimateId, userId)
    : null;

  return (
    <QuoteDetail
      quote={quote}
      backHref="/invoices"
      sourceEstimateId={sourceEstimate?.id}
      sourceEstimateNumber={sourceEstimate?.quoteNumber}
    />
  );
}
