/**
 * Icônes vectorielles (tracés de style Lucide, licence ISC) utilisées à la fois
 * dans le picker React et dans le rendu SVG/canvas des textes du QR code.
 */
export const QR_ICON_PATHS = {
  wifi: "M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.859a10 10 0 0 1 14 0M8.5 16.429a5 5 0 0 1 7 0",
  gift: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H8.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h3.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  eye: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  sparkles:
    "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
  ghost:
    "M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 3 2.5-3 2.5 3 3-3V10a8 8 0 0 0-8-8z",
  camera:
    "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  heart:
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  music:
    "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  coffee:
    "M10 2v2M14 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1M6 2v2",
  flame:
    "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  star: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
  smile:
    "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
} as const;

export type QrIconKey = keyof typeof QR_ICON_PATHS;

export const QR_ICON_OPTIONS: Array<{ key: QrIconKey; label: string }> = [
  { key: "wifi", label: "Wi-Fi" },
  { key: "gift", label: "Cadeau" },
  { key: "eye", label: "Œil" },
  { key: "sparkles", label: "Étincelles" },
  { key: "ghost", label: "Fantôme" },
  { key: "camera", label: "Photo" },
  { key: "heart", label: "Cœur" },
  { key: "music", label: "Musique" },
  { key: "coffee", label: "Café" },
  { key: "flame", label: "Flamme" },
  { key: "star", label: "Étoile" },
  { key: "smile", label: "Sourire" },
];

export function isQrIcon(value: string | null | undefined): value is QrIconKey {
  return Boolean(value && value in QR_ICON_PATHS);
}
