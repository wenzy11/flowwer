"use client";

/** Full navigation so middleware sees the new session cookie immediately. */
export function redirectAfterSignIn(locale: string) {
  const path = `/${locale}/dashboard`;
  window.location.replace(path);
}
