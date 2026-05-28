import { NextRequest, NextResponse } from "next/server";

import { verifySessionCookie } from "@/lib/auth/firebase-server";
import { getQuoteWithDetails } from "@/lib/db/quotes";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySessionCookie();
  if (!session?.uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quote = await getQuoteWithDetails(id, session.uid);

  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(quote);
}
