"use client";

import type { Auth } from "firebase/auth";

import { establishServerSession } from "@/lib/auth/session-client";
import { waitForFirebaseUser } from "@/lib/auth/wait-for-firebase-user";

export async function finishClientSignIn(auth: Auth): Promise<void> {
  const user = await waitForFirebaseUser(auth);
  const idToken = await user.getIdToken(true);
  await establishServerSession(idToken);
}
