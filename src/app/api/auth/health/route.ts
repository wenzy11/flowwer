import { NextResponse } from "next/server";

import { sanitizeEnv } from "@/lib/env/sanitize";
import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { loadAdminCredentialParts } from "@/lib/firebase/admin-credentials";

export async function GET() {
  const clientProjectId = sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const clientConfigured = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      clientProjectId
  );

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({
      ok: false,
      clientConfigured,
      adminConfigured: false,
      adminInit: "missing_env",
      projectMatch: false,
    });
  }

  try {
    const { projectId: adminProjectId } = loadAdminCredentialParts();
    getAdminAuth();
    const projectMatch =
      Boolean(clientProjectId) && clientProjectId === adminProjectId;

    return NextResponse.json({
      ok: projectMatch,
      clientConfigured,
      adminConfigured: true,
      adminInit: "ok",
      projectMatch,
      clientProjectId: clientProjectId ?? null,
      adminProjectId,
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
      projectMatch: false,
    });
  }
}
