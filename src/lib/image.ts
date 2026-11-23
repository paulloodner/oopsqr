/**
 * Compression d'images entièrement côté client, transparente pour
 * l'utilisateur : redimensionnement, suppression des métadonnées (le canvas
 * ne les conserve pas), conversion WebP et essais successifs de qualité.
 */

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
  bytes: number;
  mime: string;
}

export interface ProcessOptions {
  mode: "online" | "offline";
  maxSizePx?: number;
}

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isSupportedImage(file: File): boolean {
  if (SUPPORTED_TYPES.includes(file.type)) return true;
  return file.type === "image/jpg";
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image_unreadable"));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
}

async function encode(
  source: HTMLImageElement,
  width: number,
  height: number,
  mime: string,
  quality: number
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  return toBlob(canvas, mime, quality);
}

export async function processImage(
  file: File,
  options: ProcessOptions
): Promise<ProcessedImage> {
  if (!isSupportedImage(file)) throw new Error("unsupported_format");

  const maxSize = options.maxSizePx ?? (options.mode === "offline" ? 480 : 1280);
  const img = await loadImage(file);

  const ratio = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * ratio));
  const height = Math.max(1, Math.round(img.naturalHeight * ratio));

  // Mode connecté : qualité visuelle conservée, format WebP.
  const onlineQualities = [0.86, 0.78, 0.7, 0.6];
  if (options.mode === "online") {
    for (const quality of onlineQualities) {
      const blob = await encode(img, width, height, "image/webp", quality);
      if (blob && blob.type === "image/webp") {
        if (blob.size <= 450_000 || quality === onlineQualities[onlineQualities.length - 1]) {
          return { blob, width, height, bytes: blob.size, mime: "image/webp" };
        }
      }
    }
    const fallback = await encode(img, width, height, "image/jpeg", 0.82);
    if (!fallback) throw new Error("compression_failed");
    return {
      blob: fallback,
      width,
      height,
      bytes: fallback.size,
      mime: "image/jpeg",
    };
  }

  // Mode hors ligne : compression agressive (dimensions réduites, qualité basse).
  const offlineSizes = [480, 360, 260, 200];
  const offlineQualities = [0.5, 0.4, 0.3, 0.22, 0.16];
  for (const size of offlineSizes) {
    const w = Math.max(1, Math.round(img.naturalWidth * (size / Math.max(img.naturalWidth, img.naturalHeight))));
    const h = Math.max(1, Math.round(img.naturalHeight * (size / Math.max(img.naturalWidth, img.naturalHeight))));
    for (const quality of offlineQualities) {
      const blob = await encode(img, w, h, "image/webp", quality);
      if (blob && blob.size <= 1200) {
        return { blob, width: w, height: h, bytes: blob.size, mime: "image/webp" };
      }
    }
  }
  const last = await encode(img, 200, 200, "image/webp", 0.16);
  if (!last) throw new Error("compression_failed");
  return { blob: last, width: 200, height: 200, bytes: last.size, mime: "image/webp" };
}

// formatBytes est défini dans validation.ts et réexporté via l'index.
