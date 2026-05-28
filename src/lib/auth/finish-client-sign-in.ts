"use client";

import type { Auth, User } from "firebase/auth";

import { establishServerSession } from "@/lib/auth/session-client";
import { waitForFirebaseUser } from "@/lib/auth/wait-for-firebase-user";

export async function finishClientSignIn(auth: Auth, user?: User): Promise<void> {
  const resolved = user ?? (await waitForFirebaseUser(auth, 15000));
  const idToken = await resolved.getIdToken(true);
  await establishServerSession(idToken);
}
