import { getTranslations } from "next-intl/server";

import { SettingsForm } from "@/components/settings/settings-form";
import { PageHeader } from "@/components/layout/page-header";
import { requireUserId } from "@/lib/auth/user";
import { ensureDbReady } from "@/lib/init-db";
import { getCompanySettings } from "@/lib/db/quotes";

type SettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  const userId = await requireUserId();
  ensureDbReady();
  const settings = await getCompanySettings(userId);
  const t = await getTranslations("settings");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("description")} />
      <SettingsForm settings={settings} locale={locale} />
    </div>
  );
}
