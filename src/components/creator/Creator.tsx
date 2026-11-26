"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Eye,
  ImagePlus,
  Link2,
  Loader2,
  Palette,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from "lucide-react";
import type { Surprise } from "@/lib/types";
import {
  buildQrSvg,
  contrastRatio,
  safeColor,
  utf8Bytes,
} from "@/lib/qr-render";
import { COLOR_SWATCHES, QR_THEMES, QUICK_EMOJIS } from "@/lib/themes";
import { sanitizeCaption, sanitizeEmoji, sanitizeText } from "@/lib/validation";
import { POSTER_PRESETS, exportPdf, exportPng, exportSvg } from "@/lib/download";
import { prepareLogo } from "@/lib/logo";
import { isQrIcon, type QrIconKey } from "@/lib/qr-icons";
import { ImageCropper, type CroppedImage } from "@/components/creator/ImageCropper";
import { IconPicker } from "@/components/creator/IconPicker";
import { AdSlot } from "@/components/AdSlot";
import { useDebouncedValue } from "@/lib/use-debounced";
import { Toast } from "@/components/Toast";

type Mode = "connected" | "offline";
type Source = "library" | "text" | "image";
type DotStyle = "square" | "rounded" | "dots";

interface CreatorProps {
  surprises: Surprise[];
  initialSurpriseId?: string;
  initialSource?: "library" | "text" | "image";
  initialMode?: Mode;
  draftRequested?: boolean;
  siteUrl: string;
}

interface CreatedContent {
  id: string;
  url: string;
  expiresAt: string;
  signature: string;
}

const MAX_TEXT = 1200;

function Signature(parts: unknown[]): string {
  return JSON.stringify(parts);
}

export function Creator({
  surprises,
  initialSurpriseId,
  initialSource = "library",
  initialMode = "connected",
  draftRequested = false,
  siteUrl,
}: CreatorProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [source, setSource] = useState<Source>(initialSource);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSurpriseId && surprises.some((s) => s.id === initialSurpriseId)
      ? initialSurpriseId
      : surprises[0]?.id ?? null
  );
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("🎁");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<CroppedImage | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);

  const [fg, setFg] = useState("#17151F");
  const [bg, setBg] = useState("#F7F5F0");
  const [dotStyle, setDotStyle] = useState<DotStyle>("square");
  const [cornerStyle, setCornerStyle] = useState<DotStyle>("square");
  const [labelTop, setLabelTop] = useState("");
  const [labelBottom, setLabelBottom] = useState("");
  const [labelScale, setLabelScale] = useState(1);
  const [iconTop, setIconTop] = useState<QrIconKey | null>(null);
  const [iconBottom, setIconBottom] = useState<QrIconKey | null>(null);
  const [activeTheme, setActiveTheme] = useState("classique");

  const [created, setCreated] = useState<CreatedContent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [preset, setPreset] = useState("a4");
  const [origin, setOrigin] = useState(siteUrl);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Toutes");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!draftRequested) return;
    try {
      const raw = window.sessionStorage.getItem("oopsqr-draft");
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        text?: unknown;
        themeId?: unknown;
        iconTop?: unknown;
        mode?: unknown;
        labelTop?: unknown;
        labelBottom?: unknown;
        labelScale?: unknown;
      };
      if (typeof draft.text === "string") {
        setSource("text");
        setText(draft.text.slice(0, MAX_TEXT));
      }
      if (draft.mode === "offline") setMode("offline");
      if (typeof draft.themeId === "string") applyTheme(draft.themeId);
      if (typeof draft.labelTop === "string") setLabelTop(draft.labelTop.slice(0, 40));
      if (typeof draft.labelBottom === "string") setLabelBottom(draft.labelBottom.slice(0, 40));
      if (typeof draft.labelScale === "number") {
        setLabelScale(Math.max(0.7, Math.min(1.3, draft.labelScale)));
      }
      if (typeof draft.iconTop === "string" && isQrIcon(draft.iconTop)) {
        setIconTop(draft.iconTop);
      }
      window.sessionStorage.removeItem("oopsqr-draft");
    } catch {
      // Un brouillon invalide ne doit jamais empêcher l'ouverture de l'éditeur.
    }
  }, [draftRequested]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (image) {
      return () => URL.revokeObjectURL(image.preview);
    }
  }, [image]);

  const selected = surprises.find((s) => s.id === selectedId) ?? null;

  const categories = useMemo(() => {
    const set = new Set(surprises.map((s) => s.category));
    return ["Toutes", ...Array.from(set).sort()];
  }, [surprises]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return surprises.filter(
      (s) =>
        (category === "Toutes" || s.category === category) &&
        (!q ||
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.text.toLowerCase().includes(q))
    );
  }, [surprises, query, category]);

  const isImage = mode === "connected" && source === "image" && image !== null;
  const contentText = source === "library" ? selected?.text ?? "" : text;
  const contentEmoji = source === "library" ? selected?.emoji ?? "🎁" : emoji;
  // En mode « Mon image », seule une image importée autorise la génération :
  // un ancien texte saisi dans l'autre onglet ne doit JAMAIS être publié.
  const hasContent =
    mode === "connected" && source === "image"
      ? image !== null
      : contentText.trim().length > 0;

  const signature = Signature([
    mode,
    source,
    selectedId,
    text,
    emoji,
    caption,
    image?.bytes ?? 0,
    fg,
    bg,
    dotStyle,
    cornerStyle,
    labelTop,
    labelBottom,
    labelScale,
    iconTop,
    iconBottom,
    logo ? "logo" : "",
  ]);

  const stale = created !== null && created.signature !== signature;
  const displayUrl = created?.url ?? `${origin}/s/apercu`;
  const payload = mode === "offline" ? contentText : displayUrl;
  // La matrice QR n'est recalculée qu'après 200 ms sans frappe (pas à chaque
  // caractère), pour éviter de bloquer le thread principal pendant la saisie.
  const debouncedPayload = useDebouncedValue(payload, 200);

  const qr = useMemo(
    () =>
      buildQrSvg({
        data: debouncedPayload || "OOPSQR",
        fg: safeColor(fg, "#17151F"),
        bg: safeColor(bg, "#F7F5F0"),
        dotStyle,
        cornerStyle,
        labelTop,
        labelBottom,
        labelScale,
        iconTop,
        iconBottom,
        logo,
        preferredLevel: logo ? "H" : "Q",
      }),
    [
      debouncedPayload,
      fg,
      bg,
      dotStyle,
      cornerStyle,
      labelTop,
      labelBottom,
      labelScale,
      iconTop,
      iconBottom,
      logo,
    ]
  );

  const contrast = contrastRatio(safeColor(fg, "#17151F"), safeColor(bg, "#F7F5F0"));
  const bytes = utf8Bytes(contentText);
  const capacityError =
    mode === "offline" && contentText.length > 0 && !qr
      ? "Ce message est trop long pour tenir dans un QR code hors ligne. Raccourcis le texte ou passe en mode connecté."
      : "";
  const contrastError =
    contrast < 3
      ? "Contraste insuffisant : le QR risque de ne pas être lu. Choisis des couleurs plus opposées."
      : "";
  const inverted = contrast >= 3 && !isLight(bg) && isLight(fg);

  const ready =
    mode === "offline"
      ? hasContent && !capacityError && !contrastError
      : Boolean(created) && !stale && !contrastError;

  function invalidate() {
    setCreated(null);
    setError("");
  }

  function changeMode(next: Mode) {
    setMode(next);
    if (next === "offline" && source === "image") setSource("text");
    invalidate();
  }

  function changeSource(next: Source) {
    setSource(next);
    invalidate();
  }

  function applyTheme(id: string) {
    const theme = QR_THEMES.find((t) => t.id === id);
    if (!theme) return;
    setFg(theme.fg);
    setBg(theme.bg);
    setDotStyle(theme.dotStyle);
    setCornerStyle(theme.cornerStyle);
    setLabelTop(theme.labelTop);
    setLabelBottom(theme.labelBottom);
    setLabelScale(theme.labelScale);
    setIconTop(theme.iconTop ?? null);
    setIconBottom(theme.iconBottom ?? null);
    setActiveTheme(theme.id);
  }

  function updateStyle(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setActiveTheme("");
    };
  }

  async function handleImageFile(file: File | null) {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/i.test(file.type)) {
      setError("Format non supporté. Utilise JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image trop lourde (10 Mo max).");
      return;
    }
    setCropFile(file);
  }

  async function handleLogoFile(file: File | null) {
    if (!file) return;
    setLogoBusy(true);
    setError("");
    try {
      const dataUrl = await prepareLogo(file);
      setLogo(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo illisible.");
    } finally {
      setLogoBusy(false);
    }
  }

  async function generate() {
    if (!hasContent) {
      setError("Ajoute un contenu avant de générer le QR code.");
      return;
    }
    if (mode === "offline") {
      if (capacityError) return;
      setToast("QR code hors ligne prêt à être téléchargé.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("type", isImage ? "image" : "text");
      form.append("mode", "online");
      form.append("text", isImage ? "" : sanitizeText(contentText, MAX_TEXT));
      form.append("emoji", isImage ? "" : sanitizeEmoji(contentEmoji));
      form.append("caption", isImage ? sanitizeCaption(caption) : "");
      form.append("fg", safeColor(fg, "#17151F"));
      form.append("bg", safeColor(bg, "#F7F5F0"));
      if (isImage && image) {
        form.append("image", image.blob, "surprise.webp");
      }
      const res = await fetch("/api/content", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Trop de QR codes créés récemment. Réessaie dans une heure.");
        }
        throw new Error(
          data?.error === "image_requise"
            ? "Image manquante."
            : "La création a échoué. Réessaie dans un instant."
        );
      }
      setCreated({
        id: data.id,
        url: data.url,
        expiresAt: data.expiresAt,
        signature,
      });
      setToast("QR code généré ! Il expire dans 14 jours.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.url);
      setToast("Lien copié !");
    } catch {
      setToast("Impossible de copier automatiquement.");
    }
  }

  function fileName(extension: string) {
    return `oopsqr-${created?.id ?? "hors-ligne"}.${extension}`;
  }

  const [exporting, setExporting] = useState(false);

  async function withExport(action: () => Promise<unknown> | unknown) {
    if (!ready) {
      setError("Génère d'abord ton QR code.");
      return;
    }
    if (contrastError) {
      setError(contrastError);
      return;
    }
    // Empêche les doubles clics : un export lourd ne doit pas être relancé
    // pendant qu'un autre est en cours (les boutons sont aussi désactivés).
    if (exporting) return;
    setExporting(true);
    try {
      await action();
      setToast("Téléchargement lancé !");
      if (created) {
        fetch(`/api/content/${created.id}/download`, { method: "POST" }).catch(() => {});
      }
    } catch (err) {
      setError(
        err instanceof Error && err.message === "qr_capacity"
          ? "Le contenu dépasse la capacité du QR code."
          : "Le téléchargement a échoué."
      );
    } finally {
      setExporting(false);
    }
  }

  const qrInput = {
    data: payload || "OOPSQR",
    fg: safeColor(fg, "#17151F"),
    bg: safeColor(bg, "#F7F5F0"),
    dotStyle,
    cornerStyle,
    labelTop,
    labelBottom,
    labelScale,
    iconTop,
    iconBottom,
    logo,
    preferredLevel: (logo ? "H" : "Q") as "H" | "Q",
  };

  return (
    <div className="creator-layout grid gap-6 lg:grid-cols-[1fr_440px] lg:items-start">
      <div className="space-y-5">
        {/* 01 — contenu */}
        <section className="panel" id="contenu">
          <div className="panel-head">
            <span className="step-dot">01</span>
            <div>
              <h2>Choisis ta surprise</h2>
              <p>Bibliothèque, message libre ou image. Tout est permis (ou presque).</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => changeMode("connected")}
              className={`mode-card ${mode === "connected" ? "mode-card--active" : ""}`}
              aria-pressed={mode === "connected"}
            >
              <span className="mode-card__icon" aria-hidden>
                <Link2 size={19} strokeWidth={2.3} />
              </span>
              <span>
                <strong>QR connecté</strong>
                <small>URL courte, images, page de révélation. Expire en 14 jours.</small>
              </span>
            </button>
            <button
              type="button"
              onClick={() => changeMode("offline")}
              className={`mode-card ${mode === "offline" ? "mode-card--active" : ""}`}
              aria-pressed={mode === "offline"}
            >
              <span className="mode-card__icon" aria-hidden>
                <WifiOff size={19} strokeWidth={2.3} />
              </span>
              <span>
                <strong>QR hors ligne</strong>
                <small>Le texte est encodé dans le QR. Fonctionne sans Internet.</small>
              </span>
            </button>
          </div>

          <div className="tabs mt-5">
            <button
              type="button"
              data-active={source === "library"}
              aria-pressed={source === "library"}
              onClick={() => changeSource("library")}
            >
              Bibliothèque
            </button>
            <button
              type="button"
              data-active={source === "text"}
              aria-pressed={source === "text"}
              onClick={() => changeSource("text")}
            >
              Mon texte
            </button>
            <button
              type="button"
              data-active={source === "image"}
              aria-pressed={source === "image"}
              onClick={() => changeSource("image")}
              disabled={mode === "offline"}
              title={mode === "offline" ? "Le mode hors ligne accepte uniquement du texte" : ""}
            >
              Mon image
            </button>
          </div>

          {source === "library" && (
            <div className="mt-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="input"
                  placeholder="Rechercher une surprise…"
                  aria-label="Rechercher une surprise"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  className="input sm:w-56"
                  aria-label="Filtrer par catégorie"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {filtered.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(s.id);
                      invalidate();
                    }}
                    className={`surprise-option ${selectedId === s.id ? "surprise-option--active" : ""}`}
                    aria-pressed={selectedId === s.id}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="min-w-0">
                      <strong>{s.title}</strong>
                      <small>{s.category}</small>
                    </span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="col-span-full py-6 text-center text-sm text-midnight/50">
                    Aucune surprise trouvée.
                  </p>
                )}
              </div>
            </div>
          )}

          {source === "text" && (
            <div className="mt-4 space-y-3">
              <div className="flex items-end justify-between gap-3">
                <label className="field-label mb-0" htmlFor="creator-text">
                  Ton message
                </label>
                <span className="text-xs text-midnight/45">
                  {text.length} / {MAX_TEXT}
                </span>
              </div>
              <textarea
                id="creator-text"
                className="textarea"
                rows={6}
                value={text}
                maxLength={MAX_TEXT}
                onChange={(e) => {
                  setText(e.target.value);
                  invalidate();
                }}
                placeholder="Le message que la personne découvrira en scannant…"
              />
              <div>
                <label className="field-label">Emoji</label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setEmoji(em);
                        invalidate();
                      }}
                      className={`emoji-chip ${emoji === em ? "emoji-chip--active" : ""}`}
                      aria-pressed={emoji === em}
                      aria-label={`Emoji ${em}`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {source === "image" && (
            <div className="mt-4 space-y-3">
              <label className="upload-zone">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
                />
                <span className="mode-card__icon" aria-hidden>
                  <ImagePlus size={23} strokeWidth={2.2} />
                </span>
                <strong>Importer une image</strong>
                <small>JPG, PNG ou WebP · 10 Mo max · recadrage et compression automatiques</small>
              </label>
              {image && (
                <div className="flex items-center gap-3 rounded-2xl border border-midnight/10 bg-cream p-3">
                  <img
                    src={image.preview}
                    alt="Aperçu de l'image"
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-semibold text-midnight">Image optimisée</p>
                    <p className="text-midnight/50">
                      {image.width} × {image.height} · {Math.round(image.bytes / 1024)} Ko
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setImage(null);
                      invalidate();
                    }}
                  >
                    Retirer
                  </button>
                </div>
              )}
              <div>
                <label className="field-label">Légende (optionnelle)</label>
                <input
                  className="input"
                  value={caption}
                  maxLength={140}
                  onChange={(e) => {
                    setCaption(e.target.value);
                    invalidate();
                  }}
                  placeholder="Ex. : la tête de ton chat à 3 h du matin"
                />
              </div>
            </div>
          )}

          {source === "library" && selected && (
            <div className="mt-4 rounded-2xl border border-midnight/10 bg-cream p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-midnight/40">
                Aperçu du contenu
              </p>
              <p className="mt-1 whitespace-pre-line font-display text-lg font-bold leading-snug text-midnight">
                {selected.emoji} {selected.text}
              </p>
            </div>
          )}
        </section>

        {/* 02 — style */}
        <section className="panel" id="style">
          <div className="panel-head">
            <span className="step-dot">02</span>
            <div>
              <h2>Personnalise ton QR</h2>
              <p>Trois clics suffisent. Le contraste est vérifié automatiquement.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {QR_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => applyTheme(theme.id)}
                className={`theme-card ${activeTheme === theme.id ? "theme-card--active" : ""}`}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-5 w-5 rounded-md"
                    style={{ background: theme.bg, border: `3px solid ${theme.fg}` }}
                  />
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ background: theme.fg }}
                  />
                </span>
                <strong>{theme.name}</strong>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Couleur des modules</label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={safeColor(fg, "#17151F")}
                  onChange={(e) => updateStyle(setFg)(e.target.value)}
                  className="color-input"
                  aria-label="Couleur des modules"
                />
                {COLOR_SWATCHES.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateStyle(setFg)(c)}
                    className="swatch swatch--light"
                    style={{ backgroundColor: c }}
                    aria-label={`Couleur ${c}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="field-label">Arrière-plan</label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={safeColor(bg, "#F7F5F0")}
                  onChange={(e) => updateStyle(setBg)(e.target.value)}
                  className="color-input"
                  aria-label="Couleur d'arrière-plan"
                />
                {COLOR_SWATCHES.slice(2).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateStyle(setBg)(c)}
                    className="swatch swatch--light"
                    style={{ backgroundColor: c }}
                    aria-label={`Couleur ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Forme des modules</label>
              <div className="segmented segmented--light">
                {(["square", "rounded", "dots"] as DotStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    data-active={dotStyle === style}
                    onClick={() => {
                      setDotStyle(style);
                      setActiveTheme("");
                    }}
                  >
                    {style === "square" ? "■ Carré" : style === "rounded" ? "▢ Arrondi" : "● Points"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="field-label">Coins</label>
              <div className="segmented segmented--light">
                {(["square", "rounded", "dots"] as DotStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    data-active={cornerStyle === style}
                    onClick={() => {
                      setCornerStyle(style);
                      setActiveTheme("");
                    }}
                  >
                    {style === "square" ? "■" : style === "rounded" ? "▢" : "●"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="label-top">
                Texte au-dessus
              </label>
              <input
                id="label-top"
                className="input"
                value={labelTop}
                maxLength={40}
                onChange={(e) => {
                  setLabelTop(e.target.value);
                  setActiveTheme("");
                }}
                placeholder="SCANNE-MOI"
              />
              <div className="mt-2">
                <IconPicker
                  label="Icône du texte supérieur"
                  value={iconTop}
                  disabled={!labelTop.trim()}
                  hint={!labelTop.trim() ? "Ajoute d’abord un texte pour afficher l’icône." : undefined}
                  onChange={(value) => {
                    setIconTop(value);
                    setActiveTheme("");
                  }}
                />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="label-bottom">
                Texte en dessous
              </label>
              <input
                id="label-bottom"
                className="input"
                value={labelBottom}
                maxLength={40}
                onChange={(e) => {
                  setLabelBottom(e.target.value);
                  setActiveTheme("");
                }}
                placeholder="UNE SURPRISE T'ATTEND"
              />
              <div className="mt-2">
                <IconPicker
                  label="Icône du texte inférieur"
                  value={iconBottom}
                  disabled={!labelBottom.trim()}
                  hint={!labelBottom.trim() ? "Ajoute d’abord un texte pour afficher l’icône." : undefined}
                  onChange={(value) => {
                    setIconBottom(value);
                    setActiveTheme("");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Taille du texte</label>
              <input
                type="range"
                min={0.7}
                max={1.3}
                step={0.05}
                value={labelScale}
                onChange={(e) => {
                  setLabelScale(Number(e.target.value));
                  setActiveTheme("");
                }}
                className="w-full accent-violet"
              />
            </div>
            <div>
              <label className="field-label">Logo central (optionnel)</label>
              <div className="flex items-center gap-2">
                <label className="btn btn-secondary btn-sm cursor-pointer">
                  {logoBusy ? "Chargement…" : "Ajouter un logo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(e) => handleLogoFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {logo && (
                  <>
                    <img src={logo} alt="Logo" className="h-8 w-8 rounded-md border border-midnight/10" />
                    <button
                      type="button"
                      onClick={() => {
                        setLogo(null);
                        invalidate();
                      }}
                      className="text-xs font-semibold text-rose hover:underline"
                    >
                      Retirer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["SCANNE-MOI", "UNE SURPRISE T'ATTEND", "WIFI GRATUIT ICI", "TU NE DEVINERAS JAMAIS"].map(
              (idea) => (
                <button
                  key={idea}
                  type="button"
                  className="chip"
                  onClick={() => {
                    setLabelTop(idea);
                    setActiveTheme("");
                  }}
                >
                  {idea}
                </button>
              )
            )}
          </div>
        </section>

        <AdSlot variant="editor" />
      </div>

      {/* colonne de droite */}
      <aside className="creator-preview space-y-4 lg:sticky lg:top-24">
        <div className="preview-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-midnight/40">
              Aperçu en direct
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide ${
                contrast >= 4.5
                  ? "bg-lime/40 text-midnight"
                  : contrast >= 3
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose/10 text-rose"
              }`}
            >
              Contraste {contrast.toFixed(1)}:1
            </span>
          </div>

          <div className="qr-stage">
            {qr ? (
              <div
                className="qr-svg"
                dangerouslySetInnerHTML={{ __html: qr.svg }}
              />
            ) : (
              <div className="flex aspect-square w-full max-w-[300px] items-center justify-center rounded-xl bg-white p-6 text-center text-sm text-midnight/50">
                {capacityError || "Ajoute un contenu pour voir ton QR code."}
              </div>
            )}
          </div>

          <div className="mt-3 space-y-1 text-xs text-midnight/55">
            <div className="flex justify-between">
              <span>Correction d&apos;erreur</span>
              <strong className="text-midnight">{qr?.level ?? "—"}</strong>
            </div>
            {mode === "offline" ? (
              <div className="flex justify-between">
                <span>Capacité utilisée</span>
                <strong className="text-midnight">
                  {bytes} octets {qr ? `· niveau ${qr.level}` : ""}
                </strong>
              </div>
            ) : (
              <div className="flex justify-between">
                <span>Mode</span>
                <strong className="text-midnight">Connecté · 14 jours</strong>
              </div>
            )}
          </div>

          {(contrastError || capacityError || inverted || stale) && (
            <div className="mt-3 space-y-1.5">
              {contrastError && <p className="alert alert--error">{contrastError}</p>}
              {inverted && (
                <p className="alert alert--warn">
                  QR inversé (clair sur fond sombre) : teste-le avant impression.
                </p>
              )}
              {capacityError && <p className="alert alert--error">{capacityError}</p>}
              {stale && (
                <p className="alert alert--warn">
                  Le contenu a changé. Régénère le QR pour mettre à jour le lien.
                </p>
              )}
            </div>
          )}

          {mode === "connected" ? (
            created && !stale ? (
              <div className="mt-3 space-y-2">
                <label className="field-label">Lien de révélation</label>
                <div className="flex gap-2">
                  <input className="input flex-1 text-xs" readOnly value={created.url} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={copyLink}>
                    <Copy size={14} />
                    Copier
                  </button>
                </div>
                <p className="text-[0.7rem] text-midnight/45">
                  Expire le{" "}
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(created.expiresAt))}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={generate}
                disabled={busy || !hasContent || Boolean(contrastError)}
                className="btn btn-primary mt-3 w-full"
              >
                {busy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Génération…
                  </>
                ) : stale ? (
                  <>
                    <RefreshCw size={16} />
                    Régénérer le QR
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Générer mon QR code
                  </>
                )}
              </button>
            )
          ) : (
            <div className="mt-3 rounded-xl bg-lime/25 p-3 text-xs text-midnight/70">
              Hors ligne, ton texte n&apos;est jamais envoyé : il est encodé
              directement dans le QR code, sur ton appareil.
            </div>
          )}

          {error && (
            <p className="alert alert--error mt-2" role="alert">
              {error}
            </p>
          )}

          <div className="mt-4 space-y-2">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="field-label mb-0">Télécharger</span>
                <span className="text-[0.68rem] font-semibold text-midnight/40">
                  PNG · SVG · PDF
                </span>
              </div>
              <label className="mt-2 block text-[0.68rem] font-semibold text-midnight/50" htmlFor="pdf-preset">
                Format du PDF imprimé
              </label>
              <select
                id="pdf-preset"
                className="mt-1 w-full rounded-xl border border-midnight/10 bg-white px-3 py-2.5 text-sm font-semibold text-midnight"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
              >
                {POSTER_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}{p.hint ? ` — ${p.hint}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2" aria-busy={exporting}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!ready || exporting}
                onClick={() => withExport(() => exportPng(qrInput, fileName("png"), 2200))}
              >
                <Download size={14} />
                {exporting ? "Export…" : "PNG"}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={!ready || exporting}
                onClick={() => withExport(() => exportSvg(qrInput, fileName("svg")))}
              >
                <Palette size={14} />
                SVG
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={!ready || exporting}
                onClick={() =>
                  withExport(() =>
                    exportPdf(qrInput, preset, fileName("pdf"), origin.replace(/^https?:\/\//, ""))
                  )
                }
              >
                <Download size={14} />
                PDF
              </button>
            </div>
            {mode === "connected" && !created && (
              <p className="text-center text-[0.7rem] text-midnight/40">
                Génère ton QR pour activer les téléchargements.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-midnight/10 bg-white p-4 text-xs leading-relaxed text-midnight/55">
          <strong className="mb-1 flex items-center gap-1.5 font-display text-sm text-midnight">
            <ShieldCheck size={16} className="text-violet-deep" />
            Garantie lisibilité
          </strong>
          Zone de silence incluse, contraste vérifié et niveau de correction adapté au
          logo. Teste toujours ton QR avant une impression en grand format.
        </div>
      </aside>

      {cropFile && (
        <ImageCropper
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onComplete={(cropped) => {
            setImage(cropped);
            setCropFile(null);
            invalidate();
            setToast("Image optimisée !");
          }}
        />
      )}

      <Toast open={Boolean(toast)} message={toast} />
    </div>
  );
}

function isLight(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return true;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
