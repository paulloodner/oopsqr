import { db } from "@/lib/db";
import { REPORT_REASONS } from "@/lib/types";
import { rateKey } from "@/lib/request";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rate = db.checkRateLimit(rateKey(req, "report"), 20, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { id?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "payload_invalide" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const reason = typeof body.reason === "string" ? body.reason : "";
  if (!id || !REPORT_REASONS.includes(reason as (typeof REPORT_REASONS)[number])) {
    return NextResponse.json({ error: "donnees_invalides" }, { status: 400 });
  }

  const creation = db.getCreation(id);
  if (
    !creation ||
    creation.status !== "active" ||
    new Date(creation.expiresAt).getTime() <= Date.now()
  ) {
    return NextResponse.json({ error: "introuvable" }, { status: 404 });
  }

  db.reportCreation(id, reason);
  return NextResponse.json({ ok: true });
}
