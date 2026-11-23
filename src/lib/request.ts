import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

export function clientIp(req: NextRequest | Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}

export function rateKey(req: NextRequest | Request, scope: string): string {
  const ip = clientIp(req);
  return `${scope}:${createHash("sha256").update(ip).digest("hex").slice(0, 32)}`;
}

export function publicOrigin(req: NextRequest | Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  try {
    return new URL(req.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function hasValidImageMagic(bytes: Buffer, mime: string): boolean {
  if (mime === "image/webp") {
    return (
      bytes.length > 12 &&
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  if (mime === "image/png") {
    return (
      bytes.length > 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }
  if (mime === "image/jpeg") {
    return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  return false;
}

export function extensionFor(mime: string): string {
  return mime === "image/webp" ? "webp" : mime === "image/jpeg" ? "jpg" : "png";
}
