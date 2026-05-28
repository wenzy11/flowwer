import { notFound } from "next/navigation";

import { ClientPortal } from "@/components/public/client-portal";
import { ensureDbReady } from "@/lib/init-db";
import { getCompanySettings, getQuoteByPublicToken } from "@/lib/db/quotes";

type PublicPortalPageProps = {
  params: Promise<{ locale: string; token: string }>;
};

export default async function PublicPortalPage({ params }: PublicPortalPageProps) {
  const { token } = await params;
  ensureDbReady();
  const quote = await getQuoteByPublicToken(token);
  if (!quote) notFound();

  const company = await getCompanySettings(quote.userId);

  return (
    <div className="min-h-dvh bg-background">
      <ClientPortal quote={quote} companyName={company.companyName} />
    </div>
  );
}
