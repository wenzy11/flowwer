import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import { AppShell } from "@/components/layout/app-shell";
import { verifySessionCookie } from "@/lib/auth/firebase-server";
import { resolveAppAccess } from "@/lib/billing/access";
import { requireUserId } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function AppLayout({
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
  const headersList = await headers();
  const path = headersList.get("x-pathname") ?? "/dashboard";
  const access = await resolveAppAccess(userId, path, locale);

  if (access.requiresSubscribe) {
    redirect(access.subscribePath);
  }

  return (
    <AppShell userEmail={user.email ?? undefined}>{children}</AppShell>
  );
}
