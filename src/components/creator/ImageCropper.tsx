"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CroppedImage {
  blob: Blob;
  preview: string;
  width: number;
  height: number;
  bytes: number;
  mime: string;
}

interface ImageCropperProps {
  file: File;
  onCancel: () => void;
  onComplete: (image: CroppedImage) => void;
}

const OUTPUT_SIZE = 1200;

export function ImageCropper({ file, onCancel, onComplete }: ImageCropperProps) {
  const [url, setUrl] = useState<string>("");
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [viewport, setViewport] = useState(340);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    const img = new Image();
    img.onload = () => setNatural({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    const measure = () => {
      if (viewportRef.current) setViewport(viewportRef.current.clientWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const aspect = natural.width && natural.height ? natural.width / natural.height : 1;
  const baseW = aspect >= 1 ? viewport * aspect : viewport;
  const baseH = aspect >= 1 ? viewport : viewport / aspect;
  const drawW = baseW * zoom;
  const drawH = baseH * zoom;
  const maxX = Math.max(0, (drawW - viewport) / 2);
  const maxY = Math.max(0, (drawH - viewport) / 2);

  const clamp = (x: number, y: number) => ({
    x: Math.max(-maxX, Math.min(maxX, x)),
    y: Math.max(-maxY, Math.min(maxY, y)),
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setOffset(clamp(dragRef.current.ox + dx, dragRef.current.oy + dy));
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const changeZoom = (next: number) => {
    setZoom(next);
    setOffset((o) => {
      const factor = 1.0001;
      return { x: o.x / factor, y: o.y / factor };
    });
  };

  const validate = useCallback(async () => {
    if (!natural.width) return;
    setBusy(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas indisponible.");
      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const scale = OUTPUT_SIZE / viewport;
      const w = drawW * scale;
      const h = drawH * scale;
      const x = OUTPUT_SIZE / 2 - w / 2 + offset.x * scale;
      const y = OUTPUT_SIZE / 2 - h / 2 + offset.y * scale;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, x, y, w, h);

      let blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.86)
      );
      let mime = "image/webp";
      if (!blob || blob.type !== "image/webp") {
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.86)
        );
        mime = "image/jpeg";
      }
      if (!blob) throw new Error("Compression impossible.");
      onComplete({
        blob,
        preview: URL.createObjectURL(blob),
        width: OUTPUT_SIZE,
        height: OUTPUT_SIZE,
        bytes: blob.size,
        mime,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du recadrage.");
    } finally {
      setBusy(false);
    }
  }, [drawH, drawW, natural.width, offset.x, offset.y, onComplete, url, viewport, zoom]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-midnight/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Recadrer l'image"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-midnight-2 p-5 text-cream shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">Recadrer l&apos;image</h2>
          <button
            onClick={onCancel}
            className="rounded-full border border-white/15 px-2.5 py-1 text-sm text-cream/70 hover:border-lime hover:text-lime"
          >
            Fermer
          </button>
        </div>
        <p className="mb-3 text-xs text-cream/55">
          Format carré, redimensionnement et compression automatiques. Fais glisser
          pour centrer le sujet.
        </p>
        <div
          ref={viewportRef}
          className="relative aspect-square w-full cursor-move overflow-hidden rounded-2xl bg-black/40"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {url && (
            <img
              src={url}
              alt="Image à recadrer"
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                width: drawW,
                height: drawH,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-lime/80" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.16)_1px,transparent_1px)] bg-[size:33.33%_33.33%]" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-cream/60">
            <span>Zoom</span>
            <span>{zoom.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            className="w-full accent-lime"
            aria-label="Zoom de l'image"
          />
        </div>
        {error && <p className="mt-3 text-sm text-rose">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="btn btn-secondary btn-sm flex-1"
            disabled={busy}
          >
            Annuler
          </button>
          <button
            onClick={validate}
            className="btn btn-primary btn-sm flex-1"
            disabled={busy || !natural.width}
          >
            {busy ? "Optimisation…" : "Utiliser cette image"}
          </button>
        </div>
      </div>
    </div>
  );
}
