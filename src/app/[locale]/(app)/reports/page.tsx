import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import { StatCard } from "@/components/ui/stat-card";
import { requireUserId } from "@/lib/auth/user";
import { ensureDbReady } from "@/lib/init-db";
import { getSalesReport } from "@/lib/db/quotes";
import { formatMoney } from "@/lib/quotes/calculate";
import { BarChart3, DollarSign, FileText, Receipt } from "lucide-react";

type ReportsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { locale } = await params;
  const userId = await requireUserId();
  ensureDbReady();
  const report = await getSalesReport(userId);
  const t = await getTranslations("reports");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("description")} />

      <InfoBanner
        variant="hero"
        title={t("bannerTitle")}
        description={t("bannerDescription")}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("totalEstimates")}
          value={report.totals.total_estimates}
          icon={FileText}
        />
        <StatCard
          label={t("totalInvoices")}
          value={report.totals.total_invoices}
          icon={Receipt}
        />
        <StatCard
          label={t("approvedValue")}
          value={formatMoney(report.totals.approved_value, locale)}
          icon={BarChart3}
          variant="primary"
        />
        <StatCard
          label={t("totalCollected")}
          value={formatMoney(report.totals.total_collected, locale)}
          icon={DollarSign}
        />
      </div>

      <section className="qf-card overflow-hidden">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="text-base font-semibold">{t("monthlyTitle")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("monthlyDescription")}
          </p>
        </div>
        {report.byMonth.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            {t("noData")}
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {report.byMonth.map((row) => (
              <div
                key={row.month}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <span className="font-medium">{row.month}</span>
                <div className="flex gap-6 text-sm">
                  <span>
                    {t("approved")}:{" "}
                    <strong className="tabular-nums">
                      {formatMoney(row.approved_estimates, locale)}
                    </strong>
                  </span>
                  <span>
                    {t("collected")}:{" "}
                    <strong className="tabular-nums text-primary">
                      {formatMoney(row.collected, locale)}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
