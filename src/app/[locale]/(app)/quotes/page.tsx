import { getTranslations } from "next-intl/server";

import { DocumentsManager } from "@/components/quotes/documents-manager";
import { PageHeader } from "@/components/layout/page-header";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requireUserId } from "@/lib/auth/user";
import { ensureDbReady } from "@/lib/init-db";
import { findInvoiceForEstimate, listEstimates } from "@/lib/db/quotes";

export default async function EstimatesPage() {
  const userId = await requireUserId();
  ensureDbReady();
  const estimates = await listEstimates(userId);
  const t = await getTranslations("quotes");

  const documents = await Promise.all(
    estimates.map(async (e) => {
      const inv = await findInvoiceForEstimate(e.id, userId);
      return {
        id: e.id,
        quoteNumber: e.quoteNumber,
        clientName: e.clientName,
        status: e.status,
        total: e.total,
        createdAt: e.createdAt,
        linkedInvoiceId: inv?.id,
      };
    })
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Link
            href="/quote-builder"
            className={cn(buttonVariants({ size: "lg" }), "h-11 shadow-sm")}
          >
            {t("newQuote")}
          </Link>
        }
      />
      <DocumentsManager
        mode="estimate"
        documents={documents}
      />
    </div>
  );
}
