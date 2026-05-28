import "server-only";

import { verifySessionCookie } from "@/lib/auth/firebase-server";

export async function requireUserId(): Promise<string> {
  const session = await verifySessionCookie();
  if (!session?.uid) {
    throw new Error("Unauthorized");
  }
  return session.uid;
}

