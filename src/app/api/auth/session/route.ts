import { NextRequest, NextResponse } from "next/server";

import {
  createFirebaseSessionCookie,
  revokeSessionCookie,
  sessionCookieOptions,
} from "@/lib/auth/firebase-server";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin not configured" },
      { status: 500 }
    );
  }

  const { idToken } = (await request.json()) as { idToken?: string };
  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    const sessionCookie = await createFirebaseSessionCookie(idToken);
    const response = NextResponse.json({ success: true });
    const opts = sessionCookieOptions();
    response.cookies.set(opts.name, sessionCookie, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      maxAge: opts.maxAge,
      path: opts.path,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE() {
  await revokeSessionCookie();
  return NextResponse.json({ success: true });
}
