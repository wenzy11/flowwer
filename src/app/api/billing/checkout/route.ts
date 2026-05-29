import { NextRequest, NextResponse } from "next/server";

import { verifySessionCookie } from "@/lib/auth/firebase-server";
import {
  getPolarProductId,
  isPolarConfigured,
  type BillingInterval,
} from "@/lib/billing/plans";
import { getPolarClient, getAppBaseUrl } from "@/lib/polar/client";

export async function POST(request: NextRequest) {
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

  const body = (await request.json()) as {
    interval?: BillingInterval;
    locale?: string;
  };
  const interval = body.interval === "year" ? "year" : "month";
  const locale = body.locale ?? "en";
  const productId = getPolarProductId(interval);

  if (!productId) {
    return NextResponse.json({ error: "product_not_configured" }, { status: 503 });
  }

  try {
    const polar = getPolarClient();
    const baseUrl = getAppBaseUrl();
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${baseUrl}/${locale}/billing/success?checkout_id={CHECKOUT_ID}`,
      customerEmail: session.email ?? undefined,
      externalCustomerId: session.uid,
      metadata: {
        userId: session.uid,
        interval,
        plan: "pro",
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[billing/checkout]", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
