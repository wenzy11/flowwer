import "server-only";

import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";

import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from "@/lib/auth/constants";
import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export async function createFirebaseSessionCookie(
  idToken: string
): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });
}

export async function verifySessionCookie(): Promise<DecodedIdToken | null> {
  if (!isFirebaseAdminConfigured()) return null;

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!session) return null;

  try {
    return await getAdminAuth().verifySessionCookie(session, true);
  } catch {
    return null;
  }
}

export async function revokeSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (session) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(session);
      await getAdminAuth().revokeRefreshTokens(decoded.sub);
    } catch {
      /* session already invalid */
    }
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE_MS / 1000,
    path: "/",
  };
}
