import { getTranslations } from "next-intl/server";

import { ClientsManager } from "@/components/clients/clients-manager";
import { PageHeader } from "@/components/layout/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserId } from "@/lib/auth/user";
import { ensureDbReady } from "@/lib/init-db";
import { listClients } from "@/lib/db/clients";

type ClientsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ClientsPage({ params }: ClientsPageProps) {
  const { locale } = await params;
  const userId = await requireUserId();
  ensureDbReady();
  const clients = await listClients(userId);
  const t = await getTranslations("clients");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("description")} />

      <InfoBanner title={t("bannerTitle")} description={t("bannerDescription")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("clientList")}</CardTitle>
          <CardDescription>{t("clientListDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientsManager clients={clients} locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
