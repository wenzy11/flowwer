import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BillingSuccessPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BillingSuccessPage({
  params,
}: BillingSuccessPageProps) {
  await params;
  const t = await getTranslations("billing.success");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      <div className="qf-card-elevated max-w-md rounded-3xl border-primary/25 bg-card/95 p-10 text-center backdrop-blur-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15">
          <CheckCircle2 className="size-9 text-primary" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-bold">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("description")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("note")}</p>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ size: "lg" }), "mt-8 h-11 w-full")}
        >
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
