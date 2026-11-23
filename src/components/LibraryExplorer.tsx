"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Dices,
  Image as ImageIcon,
  Layers,
  Search,
  X,
} from "lucide-react";
import type { Surprise } from "@/lib/types";
import { categoryMeta as styleFor } from "@/components/category-meta";
import { AdSlot } from "@/components/AdSlot";

export function LibraryExplorer({
  surprises,
  initialCategory,
}: {
  surprises: Surprise[];
  initialCategory?: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const categories = useMemo(
    () => Array.from(new Set(surprises.map((s) => s.category))),
    [surprises]
  );
  const [category, setCategory] = useState<string | null>(
    initialCategory && categories.includes(initialCategory) ? initialCategory : null
  );
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<Surprise | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return surprises.filter(
      (s) =>
        (!category || s.category === category) &&
        (!q ||
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.text.toLowerCase().includes(q))
    );
  }, [surprises, category, query]);

  function random() {
    if (filtered.length === 0) return;
    setPreview(filtered[Math.floor(Math.random() * filtered.length)]);
  }

  function chooseCategory(next: string | null) {
    setCategory(next);
    const params = new URLSearchParams(window.location.search);
    if (next) params.set("c", next);
    else params.delete("c");
    const query = params.toString();
    router.replace(query ? `/bibliotheque?${query}` : "/bibliotheque", { scroll: false });
  }

  useEffect(() => {
    if (!preview) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreview(null);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [preview]);

  return (
    <div>
      <div className="sticky-toolbar">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-midnight/35"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Chercher une blague, un thème…"
              className="input pl-9"
              aria-label="Rechercher une surprise"
            />
          </div>
          <button type="button" onClick={random} className="btn btn-violet btn-sm whitespace-nowrap">
            <Dices size={16} />
            Surprise aléatoire
          </button>
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => chooseCategory(null)}
            className={`category-chip ${category === null ? "category-chip--active" : ""}`}
          >
            <Layers size={14} />
            Toutes
            <span className="category-count">{surprises.length}</span>
          </button>
          {categories.map((item) => {
            const { Icon } = styleFor(item);
            const count = surprises.filter((s) => s.category === item).length;
            return (
              <button
                key={item}
                type="button"
                onClick={() => chooseCategory(item)}
                className={`category-chip ${category === item ? "category-chip--active" : ""}`}
              >
                <Icon size={14} />
                {item}
                <span className="category-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold text-midnight/40">
        {filtered.length} surprise{filtered.length > 1 ? "s" : ""}
        {category ? ` dans « ${category} »` : ""}
        {query ? ` pour « ${query} »` : ""}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((surprise, index) => {
          const { Icon, bg, fg, tint } = styleFor(surprise.category);
          return (
            <div key={surprise.id} className="contents">
              <button
                type="button"
                onClick={() => setPreview(surprise)}
                className="library-card group text-left"
                style={{ background: tint }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{ background: bg, color: fg }}
                  >
                    <Icon size={20} strokeWidth={2.2} />
                  </span>
                  <span className="category-pill" style={{ background: `${fg}14`, color: fg }}>
                    {surprise.category}
                  </span>
                </div>
                <h3 className="mt-3 text-lg leading-tight">{surprise.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-midnight/50">
                  {surprise.description}
                </p>
                <div className="mt-3 rounded-xl bg-white/75 p-2.5">
                  <p className="line-clamp-3 whitespace-pre-line font-display text-[0.82rem] font-bold leading-snug text-midnight/80">
                    {surprise.text}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[0.7rem] font-bold">
                  <span className="text-midnight/40">Aperçu rapide</span>
                  <span className="inline-flex items-center gap-1 text-violet-deep">
                    Utiliser <ArrowRight size={13} />
                  </span>
                </div>
              </button>
              {index === 5 && filtered.length > 6 && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <AdSlot variant="library" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 py-14 text-center">
          <p className="font-display text-lg font-bold">Aucune surprise trouvée.</p>
          <p className="mt-1 text-sm text-midnight/50">
            Essaie un autre mot ou crée la tienne dans l&apos;éditeur.
          </p>
          <Link href="/creer" className="btn btn-primary btn-sm mt-4">
            Créer mon message
          </Link>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[95] flex items-end justify-center bg-midnight/70 p-3 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={preview.title}
          onClick={() => setPreview(null)}
        >
          <div
            ref={dialogRef}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 p-5"
              style={{ background: styleFor(preview.category).tint }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl"
                  style={{
                    background: styleFor(preview.category).bg,
                    color: styleFor(preview.category).fg,
                  }}
                >
                  {(() => {
                    const Icon = styleFor(preview.category).Icon;
                    return <Icon size={18} />;
                  })()}
                </span>
                <div>
                  <p className="text-[0.62rem] font-bold uppercase tracking-wider text-midnight/40">
                    {preview.category}
                  </p>
                  <h3 className="text-lg leading-tight">{preview.title}</h3>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setPreview(null)}
                className="grid h-11 w-11 place-items-center rounded-full border border-midnight/10 bg-white text-midnight/50 hover:text-midnight"
                aria-label="Fermer l'aperçu"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-midnight/55">{preview.description}</p>
              <div
                className="mt-3 rounded-2xl border p-4"
                style={{ borderColor: `${styleFor(preview.category).fg}22` }}
              >
                <p className="whitespace-pre-line font-display text-lg font-bold leading-snug text-midnight">
                  {preview.text}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/creer?surprise=${encodeURIComponent(preview.id)}`}
                  className="btn btn-primary flex-1"
                >
                  Utiliser ce contenu
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="btn btn-secondary"
                >
                  Fermer
                </button>
              </div>
              <p className="mt-2 flex items-center gap-1 text-[0.65rem] text-midnight/35">
                <ImageIcon size={12} /> Personnalise ensuite les couleurs et le format d&apos;impression.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
