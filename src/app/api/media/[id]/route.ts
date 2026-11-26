import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Garde sur les métadonnées (sans base64), puis une SEULE lecture de l'image.
  const creation = await db.getCreationMeta(id);
  if (
    !creation ||
    creation.status !== "active" ||
    !creation.hasImage ||
    new Date(creation.expiresAt).getTime() <= Date.now()
  ) {
    return new NextResponse("Introuvable", { status: 404 });
  }
  const file = await db.readUploadedImage(id);
  if (!file) return new NextResponse("Introuvable", { status: 404 });

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(file.bytes.length),
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
