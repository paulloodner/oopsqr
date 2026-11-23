import type { Metadata } from "next";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { Creator } from "@/components/creator/Creator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Créer un QR code surprise",
  description:
    "Choisis un contenu, personnalise ton QR code et télécharge-le en PNG, SVG ou PDF. Sans inscription.",
};

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ surprise?: string; source?: string; draft?: string }>;
}) {
  const { surprise, source, draft } = await searchParams;
  const surprises = await db.listSurprises();
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const proto =
    headerStore.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`).replace(
    /\/$/,
    ""
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-violet-deep">
            Sans compte · sans email · 14 jours
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl">Crée ton QR code surprise.</h1>
          <p className="mt-2 max-w-xl text-sm text-midnight/55">
            Choisis ce que la personne verra, personnalise l&apos;apparence, puis
            télécharge ton QR prêt à imprimer.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-midnight/45">
          <span className="inline-flex h-2 w-2 rounded-full bg-lime" />
          Aucune donnée personnelle demandée
        </div>
      </header>

      <Creator
        surprises={surprises}
        initialSurpriseId={typeof surprise === "string" ? surprise : undefined}
        initialSource={
          source === "image" || source === "text" || source === "library"
            ? source
            : draft === "1"
              ? "text"
              : "library"
        }
        draftRequested={draft === "1"}
        siteUrl={siteUrl}
      />
    </main>
  );
}
