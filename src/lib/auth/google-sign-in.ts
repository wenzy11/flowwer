"use client";

import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  type Auth,
  type UserCredential,
} from "firebase/auth";

export const GOOGLE_REDIRECT_PENDING_KEY = "qf_google_redirect_pending";

export function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

/** Popup is more reliable than redirect on Vercel (no getRedirectResult race). */
export async function signInWithGoogle(auth: Auth): Promise<UserCredential> {
  return signInWithPopup(auth, createGoogleProvider());
}

export async function completeGoogleRedirectIfNeeded(
  auth: Auth
): Promise<UserCredential | null> {
  return getRedirectResult(auth);
}

export function wasGoogleRedirectPending(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY) === "1";
}

export function clearGoogleRedirectPending() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY);
}
