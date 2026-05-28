import { getTranslations } from "next-intl/server";

import { QuoteBuilderWizard } from "@/components/quotes/quote-builder-wizard";
import { PageHeader } from "@/components/layout/page-header";
import { requireUserId } from "@/lib/auth/user";
import { ensureDbReady } from "@/lib/init-db";
import { listClients } from "@/lib/db/clients";
import { listMaterials } from "@/lib/db/materials";
import { getCompanySettings } from "@/lib/db/quotes";
import type { DocumentType } from "@/lib/db/quotes";

type QuoteBuilderPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function QuoteBuilderPage({
  params,
  searchParams,
}: QuoteBuilderPageProps) {
  const { locale } = await params;
  const { type } = await searchParams;
  const documentType: DocumentType =
    type === "invoice" ? "invoice" : "estimate";

  const userId = await requireUserId();
  ensureDbReady();
  const t = await getTranslations(
    documentType === "invoice" ? "invoiceBuilder" : "quoteBuilder"
  );
  const clients = await listClients(userId);
  const materials = await listMaterials(userId);
  const company = await getCompanySettings(userId);

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("description")} />
      <QuoteBuilderWizard
        clients={clients}
        materials={materials}
        defaultMarkup={company.defaultMarkup}
        defaultTax={company.defaultTax}
        defaultTerms={company.defaultTerms}
        defaultDepositPercent={company.defaultDepositPercent}
        currency={company.currency}
        documentType={documentType}
      />
    </div>
  );
}
