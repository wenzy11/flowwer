import { NextResponse } from "next/server";

import { verifySessionCookie } from "@/lib/auth/firebase-server";
import { isPolarConfigured } from "@/lib/billing/plans";
import { getUserSubscription } from "@/lib/billing/subscription";
import { getPolarClient, getAppBaseUrl } from "@/lib/polar/client";

export async function GET() {
  if (!isPolarConfigured()) {
    return NextResponse.json(
      { error: "polar_not_configured" },
      { status: 503 }
    );
  }

  const session = await verifySessionCookie();
  if (!session?.uid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sub = await getUserSubscription(session.uid);
  if (!sub.polarCustomerId && !session.uid) {
    return NextResponse.json({ error: "no_customer" }, { status: 400 });
  }

  try {
    const polar = getPolarClient();
    const { customerPortalUrl } = await polar.customerSessions.create({
      externalCustomerId: session.uid,
      returnUrl: `${getAppBaseUrl()}/dashboard`,
    });
    return NextResponse.redirect(customerPortalUrl);
  } catch (err) {
    console.error("[billing/portal]", err);
    return NextResponse.json({ error: "portal_failed" }, { status: 500 });
  }
}
