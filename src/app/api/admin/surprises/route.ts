import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { hasSameOrigin } from "@/lib/request";
import { sanitizeEmoji, sanitizeLine, sanitizeText } from "@/lib/validation";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

interface SurprisePayload {
  category?: unknown;
  title?: unknown;
  description?: unknown;
  emoji?: unknown;
  text?: unknown;
  active?: unknown;
  sort?: unknown;
}

function parse(payload: SurprisePayload) {
  const title = sanitizeLine(payload.title, 80);
  const category = sanitizeLine(payload.category, 40) || "Divers";
  const description = sanitizeLine(payload.description, 160);
  const emoji = sanitizeEmoji(payload.emoji) || "🎁";
  const text = sanitizeText(payload.text, 1500);
  const active = payload.active === undefined ? true : Boolean(payload.active);
  const sort = Number.isFinite(Number(payload.sort)) ? Number(payload.sort) : 0;
  return { title, category, description, emoji, text, active, sort };
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "non_autorise" }, { status: 401 });
  }
  return NextResponse.json(await db.listSurprises(false));
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "non_autorise" }, { status: 401 });
  }
  if (!hasSameOrigin(req)) {
    return NextResponse.json({ error: "origine_invalide" }, { status: 403 });
  }
  let body: SurprisePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "payload_invalide" }, { status: 400 });
  }
  const data = parse(body);
  if (!data.title || !data.text) {
    return NextResponse.json({ error: "titre_et_texte_requis" }, { status: 400 });
  }
  const base = slugify(data.title) || "surprise";
  let id = base;
  let suffix = 1;
  while (await db.getSurprise(id)) {
    suffix += 1;
    id = `${base}-${suffix}`;
  }
  const saved = await db.saveSurprise({ id, ...data });
  return NextResponse.json(saved, { status: 201 });
}
