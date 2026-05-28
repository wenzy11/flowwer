import { getTranslations } from "next-intl/server";
import {
  Building2,
  FileCheck,
  Link2,
  Shield,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth/user";
import { ensureDbReady } from "@/lib/init-db";
import { cn } from "@/lib/utils";

const integrations = [
  { id: "financing", icon: Wallet, tier: "basics" },
  { id: "quickbooks", icon: Link2, tier: "pro" },
  { id: "contracts", icon: FileCheck, tier: "pro" },
  { id: "notifications", icon: Building2, tier: "pro" },
  { id: "license", icon: Shield, tier: "elite" },
] as const;

export default async function IntegrationsPage() {
  await requireUserId();
  ensureDbReady();
  const t = await getTranslations("integrations");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("description")} />

      <InfoBanner
        variant="hero"
        title={t("bannerTitle")}
        description={t("bannerDescription")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <section
              key={item.id}
              id={item.id}
              className="qf-card scroll-mt-24 p-5"
            >
              <div className="flex items-start gap-4">
                <div className="qf-icon-badge size-12 rounded-2xl">
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{t(`${item.id}.title`)}</h2>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide",
                        item.tier === "basics" && "bg-primary/12 text-primary",
                        item.tier === "pro" && "bg-blue-500/12 text-blue-700",
                        item.tier === "elite" &&
                          "bg-violet-500/12 text-violet-700"
                      )}
                    >
                      Joist {item.tier}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {t(`${item.id}.description`)}
                  </p>
                  <Button
                    className="mt-4 h-10 shadow-sm"
                    variant="outline"
                    disabled
                  >
                    {t(`${item.id}.action`)}
                  </Button>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
