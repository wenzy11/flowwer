"use client";

import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type Auth,
  type UserCredential,
} from "firebase/auth";

export function shouldUseGoogleRedirect(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

export function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export async function signInWithGoogle(auth: Auth): Promise<UserCredential | null> {
  const provider = createGoogleProvider();
  if (shouldUseGoogleRedirect()) {
    await signInWithRedirect(auth, provider);
    return null;
  }
  return signInWithPopup(auth, provider);
}

export async function completeGoogleRedirectIfNeeded(
  auth: Auth
): Promise<UserCredential | null> {
  return getRedirectResult(auth);
}
