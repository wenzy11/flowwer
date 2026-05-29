import { getTranslations } from "next-intl/server";
import { CheckCircle2, FileText } from "lucide-react";

import { SubscribeCheckout } from "@/components/billing/subscribe-checkout";
import { Link } from "@/i18n/navigation";
import { isPolarConfigured } from "@/lib/billing/plans";
import { getOnboardingComplete } from "@/lib/billing/access";
import { requireUserId } from "@/lib/auth/user";
import { siteConfig } from "@/config/site";

type SubscribePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SubscribePage({ params }: SubscribePageProps) {
  const { locale } = await params;
  const userId = await requireUserId();
  const t = await getTranslations("billing");
  const onboardingComplete = await getOnboardingComplete(userId);

  return (
    <div className="flex min-h-dvh flex-col px-4 py-10 sm:px-6 sm:py-14">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2.5 font-bold tracking-tight"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <FileText className="size-5" aria-hidden />
          </span>
          {siteConfig.name}
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-10">
        {onboardingComplete ? (
          <div className="mb-8 flex max-w-xl items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4 text-center sm:text-left">
            <CheckCircle2 className="size-6 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-semibold">{t("setupCompleteTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("setupCompleteDescription")}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8 max-w-xl text-center">
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

        <div className="w-full text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("headline")}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {t("subheadline")}
          </p>
        </div>

        <div className="mt-10 w-full">
          <SubscribeCheckout
            locale={locale}
            polarReady={isPolarConfigured()}
            defaultInterval="year"
          />
        </div>
      </main>
    </div>
  );
}
