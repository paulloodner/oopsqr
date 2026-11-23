import QRCode from "qrcode";
import { QR_ICON_PATHS, isQrIcon, type QrIconKey } from "./qr-icons";

export type DotStyle = "square" | "rounded" | "dots";
export type CornerStyle = "square" | "rounded" | "dots";
export type ErrorLevel = "L" | "M" | "Q" | "H";

export interface QrInput {
  data: string;
  fg: string;
  bg: string;
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  labelTop?: string;
  labelBottom?: string;
  labelScale?: number;
  iconTop?: QrIconKey | null;
  iconBottom?: QrIconKey | null;
  logo?: string | null;
  /** Niveau souhaité ; le renderer rétrograde automatiquement si trop long. */
  preferredLevel?: ErrorLevel;
}

export interface QrMatrix {
  size: number;
  data: Uint8Array;
  level: ErrorLevel;
}

const LEVELS_DESC: ErrorLevel[] = ["H", "Q", "M", "L"];
const HEX = /^#[0-9a-fA-F]{6}$/;

export function safeColor(value: string | undefined, fallback: string): string {
  return value && HEX.test(value) ? value.toLowerCase() : fallback;
}

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Construit la matrice QR en essayant les niveaux de correction du plus
 * robuste au plus permissif. Retourne null si le contenu ne tient pas.
 */
export function createQrMatrix(data: string, preferred: ErrorLevel = "Q"): QrMatrix | null {
  if (!data) return null;
  const order = LEVELS_DESC.slice(LEVELS_DESC.indexOf(preferred));
  for (const level of order) {
    try {
      const qr = QRCode.create(data, { errorCorrectionLevel: level });
      const raw = qr.modules.data as unknown as ArrayLike<number>;
      const size = qr.modules.size;
      const matrix = new Uint8Array(size * size);
      for (let i = 0; i < matrix.length; i += 1) matrix[i] = raw[i] ? 1 : 0;
      return { size, data: matrix, level };
    } catch {
      continue;
    }
  }
  return null;
}

export function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

export interface QrLayout {
  pad: number;
  quiet: number;
  qrSize: number;
  width: number;
  height: number;
  qrX: number;
  qrY: number;
  topFs: number;
  bottomFs: number;
  topBaseline: number;
  bottomBaseline: number;
}

const PAD = 3;
const QUIET = 4;

export function layoutFor(
  moduleCount: number,
  labelTop: string,
  labelBottom: string,
  labelScale = 1,
  iconTop?: string | null,
  iconBottom?: string | null
): QrLayout {
  const qrSize = moduleCount + QUIET * 2;
  const available = qrSize * 0.94;
  const top = labelTop.trim();
  const bottom = labelBottom.trim();
  const topFs = top
    ? Math.max(
        1.2,
        Math.min(
          3.1 * labelScale,
          available / (top.length * 0.62 + (iconTop ? 1.5 : 0))
        )
      )
    : 0;
  const bottomFs = bottom
    ? Math.max(
        1.2,
        Math.min(
          3.1 * labelScale,
          available / (bottom.length * 0.62 + (iconBottom ? 1.5 : 0))
        )
      )
    : 0;
  const topH = top ? topFs * 2.1 : 0;
  const bottomH = bottom ? bottomFs * 2.1 : 0;
  return {
    pad: PAD,
    quiet: QUIET,
    qrSize,
    width: qrSize + PAD * 2,
    height: PAD * 2 + topH + qrSize + bottomH,
    qrX: PAD,
    qrY: PAD + topH,
    topFs,
    bottomFs,
    topBaseline: PAD + topFs * 1.05,
    bottomBaseline: PAD + topH + qrSize + bottomFs * 1.05,
  };
}

function isFinderZone(x: number, y: number, size: number): boolean {
  return (
    (x <= 7 && y <= 7) ||
    (x >= size - 8 && y <= 7) ||
    (x <= 7 && y >= size - 8)
  );
}

export interface BuiltQr {
  svg: string;
  level: ErrorLevel;
  layout: QrLayout;
}

export function buildQrSvg(input: QrInput): BuiltQr | null {
  const fg = safeColor(input.fg, "#17151F");
  const bg = safeColor(input.bg, "#F7F5F0");
  const preferred = input.preferredLevel ?? (input.logo ? "H" : "Q");
  const matrix = createQrMatrix(input.data, preferred);
  if (!matrix) return null;

  const { size, data } = matrix;
  const labelTop = (input.labelTop ?? "").slice(0, 48);
  const labelBottom = (input.labelBottom ?? "").slice(0, 48);
  const layout = layoutFor(
    size,
    labelTop,
    labelBottom,
    input.labelScale ?? 1,
    input.iconTop,
    input.iconBottom
  );
  const { quiet, qrX, qrY } = layout;

  const modules: string[] = [];
  const finders: string[] = [];

  const drawFinder = (fx: number, fy: number) => {
    if (input.cornerStyle === "dots") {
      finders.push(
        `<circle cx="${fx + 3.5}" cy="${fy + 3.5}" r="3.5" fill="${fg}"/>`,
        `<circle cx="${fx + 3.5}" cy="${fy + 3.5}" r="2.5" fill="${bg}"/>`,
        `<circle cx="${fx + 3.5}" cy="${fy + 3.5}" r="1.5" fill="${fg}"/>`
      );
      return;
    }
    if (input.cornerStyle === "rounded") {
      finders.push(
        `<rect x="${fx}" y="${fy}" width="7" height="7" rx="2.1" fill="${fg}"/>`,
        `<rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" rx="1.35" fill="${bg}"/>`,
        `<rect x="${fx + 2}" y="${fy + 2}" width="3" height="3" rx="0.75" fill="${fg}"/>`
      );
      return;
    }
    finders.push(
      `<path fill="${fg}" fill-rule="evenodd" d="M${fx} ${fy}h7v7h-7z M${fx + 1} ${fy + 1}h5v5h-5z M${fx + 2} ${fy + 2}h3v3h-3z"/>`
    );
  };

  drawFinder(quiet, quiet);
  drawFinder(quiet + size - 7, quiet);
  drawFinder(quiet, quiet + size - 7);

  const squarePath: string[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!data[y * size + x]) continue;
      if (isFinderZone(x, y, size)) continue;
      if (input.dotStyle === "square") {
        squarePath.push(`M${x + quiet} ${y + quiet}h1v1h-1z`);
      } else if (input.dotStyle === "dots") {
        modules.push(
          `<circle cx="${x + quiet + 0.5}" cy="${y + quiet + 0.5}" r="0.43" fill="${fg}"/>`
        );
      } else {
        modules.push(
          `<rect x="${x + quiet + 0.06}" y="${y + quiet + 0.06}" width="0.88" height="0.88" rx="0.3" fill="${fg}"/>`
        );
      }
    }
  }

  const dotHtml =
    input.dotStyle === "square"
      ? `<path fill="${fg}" d="${squarePath.join("")}"/>`
      : modules.join("");

  let logoHtml = "";
  if (input.logo && /^data:image\/(png|jpeg|webp);base64,/.test(input.logo)) {
    const box = size * 0.2;
    const plate = box + 1.5;
    const cx = quiet + size / 2;
    const cy = quiet + size / 2;
    logoHtml = `<rect x="${cx - plate / 2}" y="${cy - plate / 2}" width="${plate}" height="${plate}" rx="1.3" fill="#ffffff"/><image x="${cx - box / 2}" y="${cy - box / 2}" width="${box}" height="${box}" href="${input.logo}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  const labelFont =
    "Outfit, 'Arial Black', 'Segoe UI', system-ui, sans-serif";

  const buildLabel = (
    label: string,
    fs: number,
    baseline: number,
    icon: string | null | undefined
  ): string => {
    const iconKey = isQrIcon(icon) ? icon : null;
    const textWidth = label.length * fs * 0.6;
    const iconSize = iconKey ? fs * 1.1 : 0;
    const gap = iconKey ? fs * 0.32 : 0;
    const start = layout.width / 2 - (iconSize + gap + textWidth) / 2;
    const iconSvg = iconKey
      ? `<g transform="translate(${start},${baseline - fs * 0.95}) scale(${iconSize / 24})"><path d="${QR_ICON_PATHS[iconKey]}" fill="none" stroke="${fg}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`
      : "";
    return `${iconSvg}<text x="${start + iconSize + gap}" y="${baseline}" text-anchor="start" font-family="${labelFont}" font-weight="800" font-size="${fs}" fill="${fg}" letter-spacing="0.03em">${xmlEscape(label)}</text>`;
  };

  const labels: string[] = [];
  if (labelTop.trim()) {
    labels.push(
      buildLabel(
        labelTop.trim(),
        layout.topFs,
        layout.topBaseline,
        input.iconTop
      )
    );
  }
  if (labelBottom.trim()) {
    labels.push(
      buildLabel(
        labelBottom.trim(),
        layout.bottomFs,
        layout.bottomBaseline,
        input.iconBottom
      )
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${layout.height}" width="${layout.width * 12}" height="${layout.height * 12}" role="img" aria-label="QR code OOPSQR"><rect width="${layout.width}" height="${layout.height}" fill="${bg}"/><g transform="translate(${qrX},${qrY})">${finders.join("")}${dotHtml}${logoHtml}</g>${labels.join("")}</svg>`;

  return { svg, level: matrix.level, layout };
}

export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function drawQrCanvas(
  canvas: HTMLCanvasElement,
  input: QrInput,
  targetWidth = 2048
): Promise<{ level: ErrorLevel } | null> {
  const fg = safeColor(input.fg, "#17151F");
  const bg = safeColor(input.bg, "#F7F5F0");
  const preferred = input.preferredLevel ?? (input.logo ? "H" : "Q");
  const matrix = createQrMatrix(input.data, preferred);
  if (!matrix) return null;

  const labelTop = (input.labelTop ?? "").slice(0, 48);
  const labelBottom = (input.labelBottom ?? "").slice(0, 48);
  const layout = layoutFor(
    matrix.size,
    labelTop,
    labelBottom,
    input.labelScale ?? 1,
    input.iconTop,
    input.iconBottom
  );
  const scale = targetWidth / layout.width;
  canvas.width = Math.round(layout.width * scale);
  canvas.height = Math.round(layout.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(layout.qrX * scale, layout.qrY * scale);
  ctx.scale(scale, scale);

  const { size, data } = matrix;
  const quiet = layout.quiet;

  const finder = (fx: number, fy: number) => {
    if (input.cornerStyle === "dots") {
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(fx + 3.5, fy + 3.5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(fx + 3.5, fy + 3.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(fx + 3.5, fy + 3.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const radius = input.cornerStyle === "rounded" ? [2.1, 1.35, 0.75] : [0, 0, 0];
    ctx.fillStyle = fg;
    roundRect(ctx, fx, fy, 7, 7, radius[0]);
    ctx.fill();
    ctx.fillStyle = bg;
    roundRect(ctx, fx + 1, fy + 1, 5, 5, radius[1]);
    ctx.fill();
    ctx.fillStyle = fg;
    roundRect(ctx, fx + 2, fy + 2, 3, 3, radius[2]);
    ctx.fill();
  };

  finder(quiet, quiet);
  finder(quiet + size - 7, quiet);
  finder(quiet, quiet + size - 7);

  ctx.fillStyle = fg;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!data[y * size + x] || isFinderZone(x, y, size)) continue;
      if (input.dotStyle === "square") {
        ctx.fillRect(x + quiet, y + quiet, 1.02, 1.02);
      } else if (input.dotStyle === "dots") {
        ctx.beginPath();
        ctx.arc(x + quiet + 0.5, y + quiet + 0.5, 0.43, 0, Math.PI * 2);
        ctx.fill();
      } else {
        roundRect(ctx, x + quiet + 0.06, y + quiet + 0.06, 0.88, 0.88, 0.3);
        ctx.fill();
      }
    }
  }

  if (input.logo && /^data:image\/(png|jpeg|webp);base64,/.test(input.logo)) {
    try {
      const img = await loadImage(input.logo);
      const box = size * 0.2;
      const plate = box + 1.5;
      const cx = quiet + size / 2;
      const cy = quiet + size / 2;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, cx - plate / 2, cy - plate / 2, plate, plate, 1.3);
      ctx.fill();
      ctx.drawImage(img, cx - box / 2, cy - box / 2, box, box);
    } catch {
      // logo illisible : le QR reste valide sans logo
    }
  }

  ctx.restore();

  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  ctx.fillStyle = fg;
  ctx.textBaseline = "alphabetic";

  const drawLabel = (
    label: string,
    fsUnits: number,
    baselineUnits: number,
    icon: string | null | undefined
  ) => {
    const fs = fsUnits * scale;
    const baseline = baselineUnits * scale;
    ctx.font = `800 ${fs}px Outfit, "Arial Black", system-ui, sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const iconKey = isQrIcon(icon) ? icon : null;
    const iconSize = iconKey ? fs * 1.1 : 0;
    const gap = iconKey ? fs * 0.32 : 0;
    const start = (layout.width * scale) / 2 - (iconSize + gap + textWidth) / 2;

    if (iconKey) {
      ctx.save();
      ctx.translate(start, baseline - fs * 0.95);
      ctx.scale(iconSize / 24, iconSize / 24);
      ctx.strokeStyle = fg;
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(new Path2D(QR_ICON_PATHS[iconKey]));
      ctx.restore();
    }

    ctx.textAlign = "left";
    ctx.fillText(label, start + iconSize + gap, baseline);
  };

  if (labelTop.trim()) {
    drawLabel(labelTop.trim(), layout.topFs, layout.topBaseline, input.iconTop);
  }
  if (labelBottom.trim()) {
    drawLabel(
      labelBottom.trim(),
      layout.bottomFs,
      layout.bottomBaseline,
      input.iconBottom
    );
  }

  return { level: matrix.level };
}
