"use client";

function safeRedirectPath(from: string | null | undefined, locale: string): string {
  if (from && from.startsWith("/") && !from.startsWith("//")) {
    return from;
  }
  return `/${locale}/dashboard`;
}

/** Full navigation so middleware sees the new session cookie immediately. */
export function redirectAfterSignIn(locale: string, from?: string | null) {
  const path = safeRedirectPath(from, locale);
  window.location.replace(path);
}

export function readLoginRedirectTarget(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("from");
}
