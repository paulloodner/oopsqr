import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const creation = db.getCreation(id);
  if (
    !creation ||
    creation.status !== "active" ||
    new Date(creation.expiresAt).getTime() <= Date.now()
  ) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  db.incrementDownloads(id);
  return NextResponse.json({ ok: true });
}
