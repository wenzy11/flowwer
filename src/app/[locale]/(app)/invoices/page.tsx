import { getTranslations } from "next-intl/server";

import { DocumentsManager } from "@/components/quotes/documents-manager";
import { PageHeader } from "@/components/layout/page-header";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requireUserId } from "@/lib/auth/user";
import { ensureDbReady } from "@/lib/init-db";
import { listInvoices } from "@/lib/db/quotes";

export default async function InvoicesPage() {
  const userId = await requireUserId();
  ensureDbReady();
  const invoices = await listInvoices(userId);
  const t = await getTranslations("invoices");

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Link
            href="/quote-builder?type=invoice"
            className={cn(buttonVariants({ size: "lg" }), "h-11 shadow-sm")}
          >
            {t("newInvoice")}
          </Link>
        }
      />
      <DocumentsManager
        mode="invoice"
        documents={invoices.map((inv) => ({
          id: inv.id,
          quoteNumber: inv.quoteNumber,
          clientName: inv.clientName,
          status: inv.status,
          total: inv.total,
          createdAt: inv.createdAt,
        }))}
      />
    </div>
  );
}
