import { notFound } from "next/navigation";

import { QuoteDetail } from "@/components/quotes/quote-detail";
import { requireUserId } from "@/lib/auth/user";
import { ensureDbReady } from "@/lib/init-db";
import {
  findInvoiceForEstimate,
  getQuoteWithDetails,
} from "@/lib/db/quotes";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  ensureDbReady();
  const quote = await getQuoteWithDetails(id, userId);
  if (!quote) notFound();

  const linkedInvoice =
    quote.documentType === "estimate"
      ? await findInvoiceForEstimate(id, userId)
      : null;

  return (
    <QuoteDetail
      quote={quote}
      backHref="/quotes"
      linkedInvoiceId={linkedInvoice?.id}
      linkedInvoiceNumber={linkedInvoice?.quoteNumber}
    />
  );
}
