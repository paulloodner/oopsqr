"use client";

export async function prepareLogo(file: File): Promise<string> {
  if (!/^image\/(png|jpeg|webp)$/i.test(file.type)) {
    throw new Error("Le logo doit être un PNG, JPG ou WebP.");
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Le logo doit faire moins de 2 Mo.");
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponible.");
    const ratio = Math.min(size / img.naturalWidth, size / img.naturalHeight);
    const w = img.naturalWidth * ratio;
    const h = img.naturalHeight * ratio;
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
