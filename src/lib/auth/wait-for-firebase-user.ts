"use client";

import { onAuthStateChanged, type Auth, type User } from "firebase/auth";

export function waitForFirebaseUser(auth: Auth, timeoutMs = 15000): Promise<User> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      unsubscribe();
      reject(new Error("no_user"));
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      window.clearTimeout(timeout);
      unsubscribe();
      resolve(user);
    });
  });
}
