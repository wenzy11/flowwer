import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import { AppShell } from "@/components/layout/app-shell";
import { verifySessionCookie } from "@/lib/auth/firebase-server";

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

  return (
    <AppShell userEmail={user.email ?? undefined}>{children}</AppShell>
  );
}
