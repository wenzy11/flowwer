import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function BillingSuccessPage() {
  const t = await getTranslations("billing.success");

  return (
    <div className="mx-auto max-w-lg space-y-8 text-center">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="qf-card-elevated rounded-3xl border-primary/25 p-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15">
          <CheckCircle2 className="size-9 text-primary" aria-hidden />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{t("note")}</p>
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
