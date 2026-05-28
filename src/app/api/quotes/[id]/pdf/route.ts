import { renderToBuffer } from "@react-pdf/renderer";
import { getTranslations } from "next-intl/server";
import { NextRequest, NextResponse } from "next/server";

import { verifySessionCookie } from "@/lib/auth/firebase-server";
import {
  getCompanySettings,
  getQuoteWithDetails,
  markDocumentViewed,
} from "@/lib/db/quotes";
import { formatMoney } from "@/lib/quotes/calculate";
import { QuotePdfDocument } from "@/lib/pdf/quote-document";
import { routing } from "@/i18n/routing";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySessionCookie();
  if (!session?.uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const locale =
    request.nextUrl.searchParams.get("locale") ?? routing.defaultLocale;

  const quote = await getQuoteWithDetails(id, session.uid);
  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await markDocumentViewed(id, session.uid);

  const company = await getCompanySettings(session.uid);
  const t = await getTranslations({ locale, namespace: "pdf" });

  const formatCurrency = (value: number) =>
    formatMoney(value, locale, company.currency);

  const buffer = await renderToBuffer(
    QuotePdfDocument({
      quote,
      company,
      labels: {
        quote:
          quote.documentType === "invoice" ? t("invoice") : t("estimate"),
        billTo: t("billTo"),
        description: t("description"),
        unit: t("unit"),
        qty: t("qty"),
        unitPrice: t("unitPrice"),
        total: t("total"),
        subtotal: t("subtotal"),
        markup: t("markup"),
        tax: t("tax"),
        grandTotal: t("grandTotal"),
        deposit: t("deposit"),
        personalMessage: t("personalMessage"),
        notes: t("notes"),
        validUntil: t("validUntil"),
      },
      formatCurrency,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${quote.quoteNumber}.pdf"`,
    },
  });
}
