import { getTranslations } from "next-intl/server";
import {
  DollarSign,
  FileText,
  Plus,
  Users,
  Package,
  Receipt,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { FeatureGrid } from "@/components/dashboard/feature-grid";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { RecentQuotes } from "@/components/dashboard/recent-quotes";
import { StatusGuide } from "@/components/dashboard/status-guide";
import { InfoBanner } from "@/components/ui/info-banner";
import { StatCard } from "@/components/ui/stat-card";
import { requireUserId } from "@/lib/auth/user";
import { ensureDbReady } from "@/lib/init-db";
import {
  getCompanySettings,
  getDashboardStats,
  listEstimates,
  listRecentQuotes,
} from "@/lib/db/quotes";
import { formatMoney } from "@/lib/quotes/calculate";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const userId = await requireUserId();
  ensureDbReady();
  const stats = await getDashboardStats(userId);
  const settings = await getCompanySettings(userId);
  const estimates = await listEstimates(userId);
  const recent = await listRecentQuotes(userId, 5, "estimate");
  const t = await getTranslations("dashboard");

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
            <Plus data-icon="inline-start" />
            {t("newQuote")}
          </Link>
        }
      />

      <OnboardingChecklist
        settings={settings}
        materialsCount={stats.materialsCount}
        clientsCount={stats.clientsCount}
        estimatesCount={estimates.length}
      />

      <InfoBanner
        variant="hero"
        title={t("welcomeTitle")}
        description={t("welcomeDescription")}
      />

      <FeatureGrid />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          variant="primary"
          label={t("totalQuotesSent")}
          value={stats.quotesSent}
          hint={t("totalQuotesSentDescription")}
          icon={FileText}
        />
        <StatCard
          label={t("revenueApproved")}
          value={formatMoney(stats.revenueApproved, locale)}
          hint={t("revenueApprovedDescription")}
          icon={DollarSign}
        />
        <StatCard
          label={t("invoicesOutstanding")}
          value={formatMoney(stats.invoicesOutstanding, locale)}
          hint={t("invoicesOutstandingDescription")}
          icon={Receipt}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("drafts")}
          value={stats.draftsCount}
          hint={t("draftsHint")}
          icon={FileText}
          variant="muted"
        />
        <StatCard
          label={t("catalogItems")}
          value={stats.materialsCount}
          hint={t("catalogHint")}
          icon={Package}
          variant="muted"
        />
        <StatCard
          label={t("clientsCount")}
          value={stats.clientsCount}
          hint={t("clientsHint")}
          icon={Users}
          variant="muted"
        />
      </div>

      <RecentQuotes quotes={recent} locale={locale} />

      <StatusGuide />
    </div>
  );
}
