import type { QrIconKey } from "./qr-icons";

export interface QrTheme {
  id: string;
  name: string;
  fg: string;
  bg: string;
  dotStyle: "square" | "rounded" | "dots";
  cornerStyle: "square" | "rounded" | "dots";
  labelTop: string;
  labelBottom: string;
  labelScale: number;
  iconTop?: QrIconKey;
  iconBottom?: QrIconKey;
}

export const QR_THEMES: QrTheme[] = [
  {
    id: "classique",
    name: "Classique",
    fg: "#17151F",
    bg: "#F7F5F0",
    dotStyle: "square",
    cornerStyle: "square",
    labelTop: "",
    labelBottom: "",
    labelScale: 1,
  },
  {
    id: "acide",
    name: "Acide",
    fg: "#17151F",
    bg: "#C7F36B",
    dotStyle: "rounded",
    cornerStyle: "rounded",
    labelTop: "SCANNE-MOI",
    labelBottom: "",
    labelScale: 1,
    iconTop: "sparkles",
  },
  {
    id: "violette",
    name: "Violette",
    fg: "#5B21B6",
    bg: "#F7F5F0",
    dotStyle: "dots",
    cornerStyle: "dots",
    labelTop: "UNE SURPRISE T'ATTEND",
    labelBottom: "",
    labelScale: 1,
    iconTop: "sparkles",
  },
  {
    id: "sticker",
    name: "Sticker",
    fg: "#17151F",
    bg: "#F7F5F0",
    dotStyle: "dots",
    cornerStyle: "rounded",
    labelTop: "TU NE DEVINERAS JAMAIS",
    labelBottom: "SCANNE-MOI",
    labelScale: 0.9,
    iconTop: "ghost",
  },
  {
    id: "wifi",
    name: "Faux Wi-Fi",
    fg: "#17151F",
    bg: "#F7F5F0",
    dotStyle: "rounded",
    cornerStyle: "square",
    labelTop: "WIFI GRATUIT ICI",
    labelBottom: "SCANNE POUR LE WIFI",
    labelScale: 0.9,
    iconTop: "wifi",
  },
  {
    id: "minimal",
    name: "Minimal",
    fg: "#17151F",
    bg: "#FFFFFF",
    dotStyle: "square",
    cornerStyle: "rounded",
    labelTop: "",
    labelBottom: "",
    labelScale: 1,
  },
];

export const COLOR_SWATCHES = [
  "#17151F",
  "#8B5CF6",
  "#5B21B6",
  "#C7F36B",
  "#F7F5F0",
  "#FFFFFF",
  "#F43F5E",
  "#0EA5E9",
];

export const LABEL_IDEAS = [
  "SCANNE-MOI",
  "UNE SURPRISE T'ATTEND",
  "WIFI GRATUIT ICI",
  "SCANNE POUR LE WIFI",
  "TU NE DEVINERAS JAMAIS",
];

export const QUICK_EMOJIS = ["🎁", "😂", "👀", "🤡", "📶", "🏆", "💥", "🙃", "🕵️", "🥇", "🔮", "👑"];
