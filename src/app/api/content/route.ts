import { db } from "@/lib/db";
import { RETENTION_DAYS } from "@/lib/types";
import { sanitizeCaption, sanitizeEmoji, sanitizeText } from "@/lib/validation";
import { hasValidImageMagic, publicOrigin, rateKey } from "@/lib/request";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const rate = db.checkRateLimit(rateKey(req, "create"), 12, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "Trop de créations. Réessaie dans une heure." },
      { status: 429 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "payload_invalide" }, { status: 400 });
  }

  const type = String(form.get("type") ?? "");
  if (type !== "text" && type !== "image") {
    return NextResponse.json({ error: "type_invalide" }, { status: 400 });
  }

  const text = sanitizeText(form.get("text") ?? "");
  const emoji = sanitizeEmoji(form.get("emoji") ?? "");
  const caption = sanitizeCaption(form.get("caption") ?? "");
  const fg = /^#[0-9a-fA-F]{6}$/.test(String(form.get("fg") ?? ""))
    ? String(form.get("fg")).toLowerCase()
    : "#17151f";
  const bg = /^#[0-9a-fA-F]{6}$/.test(String(form.get("bg") ?? ""))
    ? String(form.get("bg")).toLowerCase()
    : "#f7f5f0";

  let imageBytes: Buffer | null = null;
  let imageMime: string | null = null;

  if (type === "image") {
    const file = form.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "image_requise" }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "image_trop_lourde" }, { status: 413 });
    }
    const mime = file.type;
    if (!["image/webp", "image/png", "image/jpeg"].includes(mime)) {
      return NextResponse.json({ error: "image_format" }, { status: 400 });
    }
    imageBytes = Buffer.from(await file.arrayBuffer());
    if (!hasValidImageMagic(imageBytes, mime)) {
      return NextResponse.json({ error: "image_invalide" }, { status: 400 });
    }
    imageMime = mime;
  } else if (!text) {
    return NextResponse.json({ error: "texte_requis" }, { status: 400 });
  }

  const id = db.newCreationId();
  let imagePath: string | null = null;
  if (imageBytes && imageMime) {
    imagePath = db.saveUploadedImage(id, imageBytes, imageMime);
  }

  const expiresAt = new Date(
    Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  db.createCreation({
    id,
    type,
    text: type === "text" ? text : null,
    emoji: type === "text" ? emoji || null : null,
    caption: type === "image" ? caption || null : null,
    imagePath,
    imageMime,
    fg,
    bg,
    expiresAt,
  });

  const now = Date.now();
  const store = globalThis as typeof globalThis & { __oopsqrLastCleanup?: number };
  if (now - (store.__oopsqrLastCleanup ?? 0) > 10 * 60 * 1000) {
    store.__oopsqrLastCleanup = now;
    try {
      db.cleanupExpired();
    } catch {
      // ne bloque pas la création si le nettoyage échoue
    }
  }

  return NextResponse.json(
    {
      id,
      url: `${publicOrigin(req)}/s/${id}`,
      expiresAt,
    },
    { status: 201 }
  );
}
