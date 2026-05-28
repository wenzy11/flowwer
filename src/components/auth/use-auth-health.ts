"use client";

import { useEffect, useState } from "react";

export type AuthHealth = {
  ok: boolean;
  clientConfigured?: boolean;
  adminConfigured?: boolean;
  adminInit?: string;
};

export function useAuthHealth() {
  const [health, setHealth] = useState<AuthHealth | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/health", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: AuthHealth) => {
        if (!cancelled) setHealth(data);
      })
      .catch(() => {
        if (!cancelled) setHealth({ ok: false, adminInit: "fetch_failed" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return health;
}
