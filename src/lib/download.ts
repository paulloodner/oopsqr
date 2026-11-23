import { drawQrCanvas, buildQrSvg, type QrInput } from "./qr-render";

export interface PosterPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  kind?: "poster" | "sheet";
  hint?: string;
  /** Taille de référence du QR seul, hors marges et habillage. */
  qrSizeMm?: number;
}

export const POSTER_PRESETS: PosterPreset[] = [
  { id: "label", label: "Étiquette 10 × 7 cm", width: 100, height: 70, hint: "Vitrine, comptoir", qrSizeMm: 45 },
  { id: "badge", label: "Badge 8,5 × 5,5 cm", width: 85, height: 55, hint: "Porte-clés, badge", qrSizeMm: 38 },
  { id: "a6", label: "Affiche A6 (10,5 × 14,8)", width: 105, height: 148, hint: "Petit format", qrSizeMm: 82 },
  { id: "a5", label: "Affiche A5", width: 148, height: 210, hint: "Vitrine, menu", qrSizeMm: 125 },
  { id: "a4", label: "Affiche A4", width: 210, height: 297, hint: "Impression classique", qrSizeMm: 180 },
  { id: "a3", label: "Affiche A3", width: 297, height: 420, hint: "Grand format", qrSizeMm: 260 },
  { id: "square", label: "Carré social 1080", width: 180, height: 180, hint: "Instagram, Facebook", qrSizeMm: 150 },
  { id: "story", label: "Story 9:16", width: 108, height: 192, hint: "TikTok, Reels, Stories", qrSizeMm: 88 },
  {
    id: "sheet",
    label: "Planche A4 ×12 étiquettes",
    width: 210,
    height: 297,
    kind: "sheet",
    hint: "À découper et coller",
  },
];

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function exportPng(input: QrInput, filename: string, widthPx = 2400) {
  const canvas = document.createElement("canvas");
  const result = await drawQrCanvas(canvas, input, widthPx);
  if (!result) throw new Error("qr_capacity");
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("png_failed");
  saveBlob(blob, filename);
  return { level: result.level, width: canvas.width, height: canvas.height };
}

export function exportSvg(input: QrInput, filename: string) {
  const built = buildQrSvg(input);
  if (!built) throw new Error("qr_capacity");
  saveBlob(new Blob([built.svg], { type: "image/svg+xml;charset=utf-8" }), filename);
  return { level: built.level };
}

export async function exportPdf(
  input: QrInput,
  presetId: string,
  filename: string,
  siteLabel: string
) {
  const preset =
    POSTER_PRESETS.find((item) => item.id === presetId) ??
    POSTER_PRESETS.find((item) => item.id === "a4")!;
  const { jsPDF } = await import("jspdf");
  const orientation = preset.width > preset.height ? "landscape" : "portrait";
  const pdf = new jsPDF({
    unit: "mm",
    format: [Math.min(preset.width, preset.height), Math.max(preset.width, preset.height)],
    orientation,
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = Math.max(6, Math.min(pageWidth, pageHeight) * 0.05);

  pdf.setFillColor(input.bg);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  const canvas = document.createElement("canvas");
  const isSheet = preset.kind === "sheet";
  let exportedLevel: "L" | "M" | "Q" | "H" = "Q";

  if (isSheet) {
    const columns = 3;
    const rows = 4;
    const gap = 4;
    const usableW = pageWidth - margin * 2;
    const usableH = pageHeight - margin * 2 - 6;
    const cellW = (usableW - gap * (columns - 1)) / columns;
    const cellH = (usableH - gap * (rows - 1)) / rows;
    const renderW = Math.min(1000, Math.max(500, Math.round((cellW / 25.4) * 300)));
    const result = await drawQrCanvas(canvas, input, renderW);
    if (!result) throw new Error("qr_capacity");
    exportedLevel = result.level;
    const ratio = canvas.height / canvas.width;
    const drawW = Math.min(cellW, cellH / ratio);
    const drawH = drawW * ratio;
    const image = canvas.toDataURL("image/png");

    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.2);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const x = margin + col * (cellW + gap) + (cellW - drawW) / 2;
        const y = margin + row * (cellH + gap) + (cellH - drawH) / 2;
        pdf.addImage(image, "PNG", x, y, drawW, drawH, undefined, "FAST");
        pdf.rect(
          margin + col * (cellW + gap),
          margin + row * (cellH + gap),
          cellW,
          cellH
        );
      }
    }
  } else {
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2 - 6;
    const pxWidth = Math.min(3600, Math.max(900, Math.round((availableWidth / 25.4) * 300)));
    const result = await drawQrCanvas(canvas, input, pxWidth);
    if (!result) throw new Error("qr_capacity");
    exportedLevel = result.level;

    const ratio = canvas.height / canvas.width;
    let drawWidth = availableWidth;
    let drawHeight = drawWidth * ratio;
    if (drawHeight > availableHeight) {
      drawHeight = availableHeight;
      drawWidth = drawHeight / ratio;
    }
    if (preset.qrSizeMm) {
      drawWidth = Math.min(drawWidth, preset.qrSizeMm);
      drawHeight = drawWidth * ratio;
    }
    const x = (pageWidth - drawWidth) / 2;
    const y = margin + (availableHeight - drawHeight) / 2;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, drawWidth, drawHeight, undefined, "FAST");
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(Math.max(5.5, Math.min(8, pageWidth / 24)));
  pdf.setTextColor(input.fg);
  pdf.text(`Créé avec OOPSQR · ${siteLabel}`, pageWidth / 2, pageHeight - margin / 1.7, {
    align: "center",
  });

  pdf.save(filename);
  return { level: exportedLevel, preset: preset.id };
}
