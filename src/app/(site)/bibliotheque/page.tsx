import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Dices, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { LibraryExplorer } from "@/components/LibraryExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bibliothèque de surprises",
  description:
    "Blagues Wi-Fi, fausses promesses, messages provocateurs : choisis une surprise prête à cacher derrière ton QR code.",
  // Les filtres ?c=… ne créent pas de pages dupliquées.
  alternates: { canonical: "/bibliotheque" },
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const surprises = await db.listSurprises();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <nav className="text-xs font-semibold text-midnight/40" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-midnight">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-midnight/70">Bibliothèque</span>
      </nav>

      <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-violet-deep">
            <Sparkles size={13} className="mr-1 inline" />
            {surprises.length} surprises prêtes à l&apos;emploi
          </p>
          <h1 className="mt-2 text-4xl md:text-6xl">Pioche ta mauvaise idée.</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-midnight/55 md:text-base">
            Cherche par thème, ouvre un aperçu rapide, puis transforme la surprise
            en QR code personnalisé. Sans inscription.
          </p>
        </div>
        <Link href="/creer" className="btn btn-primary">
          <Dices size={17} />
          Créer le mien
        </Link>
      </header>

      <div className="mt-8">
        <LibraryExplorer surprises={surprises} initialCategory={c} />
      </div>

      <section className="mt-14 rounded-3xl bg-white p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="text-2xl md:text-3xl">Tu as mieux en stock ?</h2>
            <p className="mt-1 text-sm text-midnight/55">
              Écris ton propre message ou importe ton image. Le QR s&apos;adapte.
            </p>
          </div>
          <Link href="/creer" className="btn btn-violet">
            Créer un QR personnalisé
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
