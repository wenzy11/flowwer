import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import {
  isFirebaseAdminConfigured,
  loadAdminCredentialParts,
} from "@/lib/firebase/admin-credentials";

export { isFirebaseAdminConfigured } from "@/lib/firebase/admin-credentials";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  const { projectId, clientEmail, privateKey } = loadAdminCredentialParts();

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}
