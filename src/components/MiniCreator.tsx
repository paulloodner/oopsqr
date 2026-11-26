"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Dices,
  Download,
  Eye,
  Gift,
  Ghost,
  ImagePlus,
  Loader2,
  Sparkles,
  Wifi,
} from "lucide-react";
import type { Surprise } from "@/lib/types";
import { buildQrSvg, safeColor, utf8Bytes } from "@/lib/qr-render";
import { exportPng } from "@/lib/download";
import { useDebouncedValue } from "@/lib/use-debounced";
import { QR_THEMES } from "@/lib/themes";
import type { QrIconKey } from "@/lib/qr-icons";

const MINI_THEME_IDS = ["acide", "classique", "violette", "sticker"] as const;
const MINI_THEMES = MINI_THEME_IDS.map((id) => {
  const theme = QR_THEMES.find((item) => item.id === id)!;
  return {
    id: theme.id,
    name: theme.name,
    fg: theme.fg,
    bg: theme.bg,
    dot: theme.dotStyle,
    corner: theme.cornerStyle,
  };
});

const MINI_ICONS: Array<{ key: QrIconKey | null; label: string; Icon: typeof Wifi }> = [
  { key: null, label: "Aucune icône", Icon: Sparkles },
  { key: "wifi", label: "Wi-Fi", Icon: Wifi },
  { key: "gift", label: "Cadeau", Icon: Gift },
  { key: "eye", label: "Œil", Icon: Eye },
  { key: "sparkles", label: "Étincelles", Icon: Sparkles },
  { key: "ghost", label: "Fantôme", Icon: Ghost },
];

interface MiniCreatorProps {
  surprises: Surprise[];
}

export function MiniCreator({ surprises }: MiniCreatorProps) {
  const [text, setText] = useState(
    "Le Wi-Fi est gratuit ici.\nLa connexion, beaucoup moins."
  );
  const [themeId, setThemeId] = useState("acide");
  const [icon, setIcon] = useState<QrIconKey | null>("wifi");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const theme = MINI_THEMES.find((item) => item.id === themeId) ?? MINI_THEMES[0];
  const previewText = text.trim().slice(0, 220);
  // Aperçu recalculé après 200 ms de pause de frappe, pas à chaque caractère.
  const debouncedText = useDebouncedValue(previewText, 200);

  const qrInput = useMemo(
    () => ({
      data: debouncedText,
      fg: safeColor(theme.fg, "#17151F"),
      bg: safeColor(theme.bg, "#F7F5F0"),
      dotStyle: theme.dot,
      cornerStyle: theme.corner,
      labelTop: "SCANNE-MOI",
      labelBottom: "UNE SURPRISE T'ATTEND",
      labelScale: 0.9,
      iconTop: icon,
      iconBottom: null,
      preferredLevel: "Q" as const,
    }),
    [debouncedText, theme, icon]
  );

  const qr = useMemo(
    () => (debouncedText ? buildQrSvg(qrInput) : null),
    [debouncedText, qrInput]
  );

  function randomSurprise() {
    if (surprises.length === 0) return;
    const pick = surprises[Math.floor(Math.random() * surprises.length)];
    setText(pick.text.slice(0, 220));
    setDone(false);
    setError("");
  }

  async function download() {
    if (!qr) return;
    setBusy(true);
    setError("");
    try {
      await exportPng(qrInput, `oopsqr-${themeId}.png`, 2200);
      setDone(true);
    } catch {
      setError("Téléchargement impossible. Réessaie dans l'éditeur.");
    } finally {
      setBusy(false);
    }
  }

  function continueInEditor() {
    try {
      window.sessionStorage.setItem(
        "oopsqr-draft",
        JSON.stringify({
          text: previewText,
          themeId,
          iconTop: icon,
          mode: "offline",
          labelTop: "SCANNE-MOI",
          labelBottom: "UNE SURPRISE T'ATTEND",
          labelScale: 0.9,
        })
      );
    } catch {
      // Le navigateur refuse parfois le stockage de session : l'éditeur s'ouvre vide.
    }
    window.location.assign("/creer?draft=1");
  }

  const byteCount = utf8Bytes(previewText);

  return (
    <section id="creer-rapide" className="mini-builder" aria-labelledby="mini-builder-title">
      <div className="mini-builder__head">
        <div>
          <p className="mini-builder__eyebrow">Créateur express</p>
          <h2 id="mini-builder-title">Ton message. Ton QR. Maintenant.</h2>
        </div>
        <span className="mini-badge">100 % gratuit</span>
      </div>

      <div className="mini-builder__preview">
        <div className="mb-2 flex items-center justify-between">
          <span className="mini-label">Aperçu live</span>
          <span className="mini-badge">Sans Internet</span>
        </div>
        <div className="mini-qr">
          {qr ? (
            <div
              className="qr-svg"
              dangerouslySetInnerHTML={{ __html: qr.svg }}
            />
          ) : (
            <div className="grid aspect-square place-items-center rounded-2xl bg-white p-5 text-center text-xs leading-relaxed text-midnight/55">
              {previewText
                ? "Ce message est trop long pour un QR hors ligne."
                : "Écris un message pour voir ton QR."}
            </div>
          )}
        </div>
        <p className="mt-2 text-center text-[0.68rem] leading-snug text-midnight/50">
          Le texte vit dans le QR : aucun envoi de données.
        </p>
      </div>

      <div className="mini-builder__form">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="mini-message" className="mini-label">
            Ton message
          </label>
          <button
            type="button"
            onClick={randomSurprise}
            className="mini-random"
            disabled={surprises.length === 0}
          >
            <Dices size={15} strokeWidth={2.4} />
            Une surprise
          </button>
        </div>
        <textarea
          id="mini-message"
          className="mini-textarea"
          rows={3}
          maxLength={220}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setDone(false);
            setError("");
          }}
          placeholder="Ta blague, ton faux Wi-Fi, ton message secret…"
        />
        <div className="mini-meta">
          <span className={qr ? "text-midnight/50" : "text-rose"}>
            {qr ? `${byteCount} octets · prêt à scanner` : "Tiens dans un QR hors ligne"}
          </span>
          <span>{text.length}/220</span>
        </div>

        <div className="mt-3">
          <span className="mini-label">Style rapide</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {MINI_THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setThemeId(item.id);
                  setDone(false);
                }}
                aria-label={`Thème ${item.name}`}
                aria-pressed={themeId === item.id}
                className={`mini-swatch ${themeId === item.id ? "mini-swatch--active" : ""}`}
                style={{ background: item.bg }}
              >
                <span className="h-5 w-5 rounded-full" style={{ background: item.fg }} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <span className="mini-label">Icône du texte</span>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {MINI_ICONS.map(({ key, label, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setIcon(key);
                  setDone(false);
                }}
                className={`mini-icon ${icon === key ? "mini-icon--active" : ""}`}
                aria-label={label}
                aria-pressed={icon === key}
                title={label}
              >
                <Icon size={17} strokeWidth={2.3} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={download}
            disabled={!qr || busy}
            className="btn btn-primary btn-sm w-full"
          >
            {busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : done ? (
              <Check size={16} />
            ) : (
              <Download size={16} />
            )}
            {done ? "PNG téléchargé" : "Télécharger le PNG"}
          </button>
          <button type="button" onClick={continueInEditor} className="btn btn-secondary btn-sm w-full">
            Ajouter une image ou un logo
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[0.7rem] leading-snug text-midnight/50">
            SVG, PDF et formats d’impression dans l’éditeur.
          </p>
          <a
            href="/creer?source=image"
            className="inline-flex min-h-11 items-center gap-1 text-[0.72rem] font-bold text-violet-deep hover:underline"
          >
            <ImagePlus size={15} />
            Image
          </a>
        </div>

        {error && <p className="mt-2 text-[0.72rem] text-rose">{error}</p>}
      </div>
    </section>
  );
}
