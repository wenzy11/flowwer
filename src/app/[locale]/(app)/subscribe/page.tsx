import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";

import { SubscribeCheckout } from "@/components/billing/subscribe-checkout";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { isPolarConfigured } from "@/lib/billing/plans";
import { getOnboardingComplete } from "@/lib/billing/access";
import { userHasActiveSubscription } from "@/lib/billing/subscription";
import { requireUserId } from "@/lib/auth/user";

type SubscribePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SubscribePage({ params }: SubscribePageProps) {
  const { locale } = await params;
  const userId = await requireUserId();

  if (await userHasActiveSubscription(userId)) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("billing");
  const onboardingComplete = await getOnboardingComplete(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title={t("headline")} description={t("subheadline")} />

      {onboardingComplete ? (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <CheckCircle2 className="size-6 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-semibold">{t("setupCompleteTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("setupCompleteDescription")}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-center sm:text-left">
          <p className="text-sm font-medium text-primary">{t("earlyAccess")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("finishSetupHint")}
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
          >
            {t("backToSetup")}
          </Link>
        </div>
      )}

      <SubscribeCheckout
        locale={locale}
        polarReady={isPolarConfigured()}
        defaultInterval="year"
      />
    </div>
  );
}
