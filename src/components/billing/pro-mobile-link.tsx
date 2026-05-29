import { getTranslations } from "next-intl/server";
import { Crown } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { userHasActiveSubscription } from "@/lib/billing/subscription";
import { requireUserId } from "@/lib/auth/user";

export async function ProMobileLink() {
  const userId = await requireUserId();
  const hasPro = await userHasActiveSubscription(userId);
  const t = await getTranslations("nav.pro");

  if (hasPro) {
    return (
      <a
        href="/api/billing/portal"
        className="inline-flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary"
        aria-label={t("manage")}
      >
        <Crown className="size-4" aria-hidden />
      </a>
    );
  }

  return (
    <Link
      href="/subscribe"
      className="inline-flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary"
      aria-label={t("upgradeCta")}
    >
      <Crown className="size-4" aria-hidden />
    </Link>
  );
}
