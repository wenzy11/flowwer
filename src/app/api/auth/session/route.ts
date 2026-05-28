import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  createFirebaseSessionCookie,
  revokeSessionCookie,
  sessionCookieOptions,
} from "@/lib/auth/firebase-server";
import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

function classifySessionError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (
    lower.includes("private key") ||
    lower.includes("decoder") ||
    lower.includes("invalid pem") ||
    lower.includes("credentials") ||
    lower.includes("must provide") ||
    lower.includes("not configured")
  ) {
    return "admin_key_invalid";
  }

  if (
    lower.includes("expired") ||
    lower.includes("id token") ||
    lower.includes("token") ||
    lower.includes("audience") ||
    lower.includes("issuer")
  ) {
    return "invalid_token";
  }

  return "session_failed";
}

export async function POST(request: NextRequest) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "admin_not_configured" },
      { status: 500 }
    );
  }

  const { idToken } = (await request.json()) as { idToken?: string };
  if (!idToken) {
    return NextResponse.json({ error: "missing_id_token" }, { status: 400 });
  }

  try {
    const adminAuth = getAdminAuth();
    await adminAuth.verifyIdToken(idToken, true);

    const sessionCookie = await createFirebaseSessionCookie(idToken);
    const opts = sessionCookieOptions();
    const cookieStore = await cookies();
    cookieStore.set(opts.name, sessionCookie, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      maxAge: opts.maxAge,
      path: opts.path,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[auth/session]", err);
    const error = classifySessionError(err);
    const status = error === "admin_key_invalid" ? 500 : 401;
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE() {
  await revokeSessionCookie();
  return NextResponse.json({ success: true });
}
