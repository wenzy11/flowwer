import { NextRequest, NextResponse } from "next/server";

import { listClients } from "@/lib/db/clients";
import { listEstimates, listInvoices } from "@/lib/db/quotes";
import { verifySessionCookie } from "@/lib/auth/firebase-server";
import { ensureDbReady } from "@/lib/init-db";

function escapeCsv(value: string | number) {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  const session = await verifySessionCookie();
  if (!session?.uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  ensureDbReady();
  const type = request.nextUrl.searchParams.get("type") ?? "estimates";

  let csv = "";
  let filename = "export.csv";

  if (type === "clients") {
    filename = "clients.csv";
    const rows = await listClients(session.uid);
    csv = [
      "name,email,phone,address",
      ...rows.map(
        (c) =>
          `${escapeCsv(c.name)},${escapeCsv(c.email)},${escapeCsv(c.phone)},${escapeCsv(c.address)}`
      ),
    ].join("\n");
  } else if (type === "invoices") {
    filename = "invoices.csv";
    const rows = await listInvoices(session.uid);
    csv = [
      "number,client,status,payment_status,total,amount_paid,created",
      ...rows.map(
        (q) =>
          `${escapeCsv(q.quoteNumber)},${escapeCsv(q.clientName)},${escapeCsv(q.status)},${escapeCsv(q.paymentStatus)},${q.total},${q.amountPaid},${escapeCsv(q.createdAt)}`
      ),
    ].join("\n");
  } else {
    filename = "estimates.csv";
    const rows = await listEstimates(session.uid);
    csv = [
      "number,client,status,total,deposit,created",
      ...rows.map(
        (q) =>
          `${escapeCsv(q.quoteNumber)},${escapeCsv(q.clientName)},${escapeCsv(q.status)},${q.total},${q.depositAmount},${escapeCsv(q.createdAt)}`
      ),
    ].join("\n");
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
