"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";

import { clearServerSession } from "@/lib/auth/session-client";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await clearServerSession();
      try {
        await signOut(getFirebaseAuth());
      } catch {
        /* firebase client optional */
      }
      router.push("/auth/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-9 w-full justify-start gap-2 text-muted-foreground"
      disabled={pending}
      onClick={handleLogout}
    >
      <LogOut className="size-4" />
      {t("signOut")}
    </Button>
  );
}
