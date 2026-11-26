export type ContentType = "text" | "image";
export type CreationStatus = "active" | "expired" | "removed";

export interface Surprise {
  id: string;
  category: string;
  title: string;
  description: string;
  emoji: string;
  text: string;
  active: boolean;
  sort: number;
  createdAt: string;
}

export interface Creation {
  id: string;
  type: ContentType;
  text: string | null;
  emoji: string | null;
  caption: string | null;
  imageB64: string | null;
  imageMime: string | null;
  fg: string;
  bg: string;
  createdAt: string;
  expiresAt: string;
  views: number;
  downloads: number;
  reportedAt: string | null;
  reportReason: string | null;
  status: CreationStatus;
  /** Présence d'une image, exposée par les lectures allégées (sans base64). */
  hasImage?: boolean;
}

export interface NewCreation {
  id: string;
  type: ContentType;
  text: string | null;
  emoji: string | null;
  caption: string | null;
  imageB64: string | null;
  imageMime: string | null;
  fg: string;
  bg: string;
  expiresAt: string;
}

export interface AdminStats {
  totalCreations: number;
  activeCreations: number;
  totalScans: number;
  totalDownloads: number;
  reports: number;
  storageBytes: number;
}

export const RETENTION_DAYS = 14;
export const MAX_TEXT_LENGTH = 1500;
export const MAX_CAPTION_LENGTH = 140;
export const REPORT_REASONS = [
  "Contenu choquant",
  "Arnaque ou tentative de phishing",
  "Spam / publicité",
  "Autre",
] as const;
