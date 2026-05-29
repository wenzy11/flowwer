import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import { verifySessionCookie } from "@/lib/auth/firebase-server";
import { userHasActiveSubscription } from "@/lib/billing/subscription";
import { requireUserId } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function SubscribeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await verifySessionCookie();
  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/auth/login`);
  }

  const userId = await requireUserId();
  const locale = await getLocale();
  const hasPro = await userHasActiveSubscription(userId);

  const path = (await headers()).get("x-pathname") ?? "";

  if (hasPro && !path.startsWith("/billing/success")) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, oklch(0.72 0.14 166 / 0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 50%, oklch(0.55 0.12 230 / 0.12), transparent), radial-gradient(ellipse 40% 30% at 0% 80%, oklch(0.65 0.1 166 / 0.15), transparent)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
