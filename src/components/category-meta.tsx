import {
  Flame,
  Gift,
  Laugh,
  Layers,
  MessageCircle,
  Sparkles,
  Wifi,
  type LucideIcon,
} from "lucide-react";

export interface CategoryMeta {
  Icon: LucideIcon;
  bg: string;
  fg: string;
  tint: string;
}

const META: Record<string, CategoryMeta> = {
  "Blagues Wi-Fi": { Icon: Wifi, bg: "#C7F36B", fg: "#17151F", tint: "#F2FBDD" },
  "Messages humoristiques": { Icon: MessageCircle, bg: "#E9DDFF", fg: "#5B21B6", tint: "#F4EEFF" },
  "Fausses promesses": { Icon: Gift, bg: "#FFE3EA", fg: "#9F1239", tint: "#FFF1F4" },
  "Messages provocateurs": { Icon: Flame, bg: "#FFE7C7", fg: "#9A3412", tint: "#FFF5EB" },
  "Surprises & révélations": { Icon: Sparkles, bg: "#D9F0FF", fg: "#075985", tint: "#EDF8FF" },
  "Mèmes & emojis": { Icon: Laugh, bg: "#F6E7FF", fg: "#7E22CE", tint: "#FAF2FF" },
};

const FALLBACK: CategoryMeta = {
  Icon: Layers,
  bg: "#EDE9FE",
  fg: "#5B21B6",
  tint: "#F5F3FF",
};

export function categoryMeta(category: string): CategoryMeta {
  return META[category] ?? FALLBACK;
}
