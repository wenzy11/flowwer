import { getTranslations } from "next-intl/server";

import { MaterialsManager } from "@/components/materials/materials-manager";
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
import { listMaterials } from "@/lib/db/materials";

type MaterialsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MaterialsPage({ params }: MaterialsPageProps) {
  const { locale } = await params;
  const userId = await requireUserId();
  ensureDbReady();
  const materials = await listMaterials(userId);
  const t = await getTranslations("materials");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("description")} />

      <InfoBanner title={t("bannerTitle")} description={t("bannerDescription")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("itemDatabase")}</CardTitle>
          <CardDescription>{t("itemDatabaseDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <MaterialsManager materials={materials} locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
