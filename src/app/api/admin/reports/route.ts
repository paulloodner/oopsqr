import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { hasSameOrigin } from "@/lib/request";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "non_autorise" }, { status: 401 });
  }
  return NextResponse.json(await db.listReports());
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "non_autorise" }, { status: 401 });
  }
  if (!hasSameOrigin(req)) {
    return NextResponse.json({ error: "origine_invalide" }, { status: 403 });
  }
  let body: { id?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "payload_invalide" }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id_requis" }, { status: 400 });

  if (body.action === "dismiss") {
    return NextResponse.json({ ok: await db.clearReport(id) });
  }
  if (body.action === "delete") {
    return NextResponse.json({ ok: await db.deleteCreation(id) });
  }
  return NextResponse.json({ error: "action_invalide" }, { status: 400 });
}
