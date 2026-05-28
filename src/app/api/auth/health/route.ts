import { NextResponse } from "next/server";

import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { loadAdminCredentialParts } from "@/lib/firebase/admin-credentials";

export async function GET() {
  const clientConfigured = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({
      ok: false,
      clientConfigured,
      adminConfigured: false,
      adminInit: "missing_env",
    });
  }

  try {
    loadAdminCredentialParts();
    getAdminAuth();
    return NextResponse.json({
      ok: true,
      clientConfigured,
      adminConfigured: true,
      adminInit: "ok",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    const adminInit = message.includes("private key")
      ? "invalid_private_key"
      : message.includes("JSON")
        ? "invalid_service_account_json"
        : "init_failed";

    return NextResponse.json({
      ok: false,
      clientConfigured,
      adminConfigured: true,
      adminInit,
    });
  }
}
