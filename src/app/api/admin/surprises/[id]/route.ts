import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { sanitizeEmoji, sanitizeLine, sanitizeText } from "@/lib/validation";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "non_autorise" }, { status: 401 });
  }
  const { id } = await params;
  const existing = db.getSurprise(id);
  if (!existing) {
    return NextResponse.json({ error: "introuvable" }, { status: 404 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "payload_invalide" }, { status: 400 });
  }

  const next = {
    id,
    title: body.title === undefined ? existing.title : sanitizeLine(body.title, 80),
    category: body.category === undefined ? existing.category : sanitizeLine(body.category, 40) || "Divers",
    description: body.description === undefined ? existing.description : sanitizeLine(body.description, 160),
    emoji: body.emoji === undefined ? existing.emoji : sanitizeEmoji(body.emoji) || "🎁",
    text: body.text === undefined ? existing.text : sanitizeText(body.text, 1500),
    active: body.active === undefined ? existing.active : Boolean(body.active),
    sort: body.sort === undefined ? existing.sort : Number(body.sort) || 0,
  };
  if (!next.title || !next.text) {
    return NextResponse.json({ error: "titre_et_texte_requis" }, { status: 400 });
  }
  return NextResponse.json(db.saveSurprise(next));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "non_autorise" }, { status: 401 });
  }
  const { id } = await params;
  const ok = db.deleteSurprise(id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
