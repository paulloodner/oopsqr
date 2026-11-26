import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { safeColor } from "@/lib/qr-render";
import { AdSlot } from "@/components/AdSlot";
import { ReportButton } from "@/components/ReportButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const creation = await db.getCreationMeta(id);
  if (!creation || creation.status !== "active") {
    return { title: "Surprise", robots: { index: false, follow: false } };
  }
  return {
    title: "Une surprise t'attend 👀",
    description: "Scanne, découvre, ris. Créé avec OOPSQR.",
    robots: { index: false, follow: false },
  };
}

export default async function RevealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creation = await db.getCreationMeta(id);
  if (!creation) notFound();

  const expired =
    creation.status !== "active" ||
    new Date(creation.expiresAt).getTime() <= Date.now();

  if (expired) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-16 text-center">
        <span className="text-6xl">🫥</span>
        <h1 className="mt-4 text-4xl md:text-5xl">Cette surprise a disparu.</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-midnight/55">
          Les contenus connectés OOPSQR sont conservés 14 jours, puis supprimés
          automatiquement. Ce lien n&apos;est plus valide.
        </p>
        <Link href="/creer" className="btn btn-primary mt-6">
          Créer un nouveau QR code
        </Link>
        <Link href="/" className="mt-3 text-xs font-semibold text-midnight/45 hover:text-midnight">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  await db.incrementView(creation.id);

  const fg = safeColor(creation.fg, "#17151F");
  const bg = safeColor(creation.bg, "#F7F5F0");

  return (
    <main
      className="flex min-h-screen flex-col"
      style={{ background: bg, color: fg }}
    >
      <header className="flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="brand text-xl"
          style={{ color: fg }}
          aria-label="OOPSQR"
        >
          <img src="/brand/icon-192.png" alt="" width={30} height={30} className="h-[30px] w-[30px] rounded-md" />
          <span>
            OOPS<span style={{ color: "#5B21B6" }}>QR</span>
          </span>
        </Link>
        <span
          className="rounded-full border px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em]"
          style={{ borderColor: `${fg}33`, color: `${fg}99` }}
        >
          Surprise révélée
        </span>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div
            className="rounded-[2rem] bg-white p-6 text-center shadow-[0_28px_80px_-30px_rgba(23,21,31,0.55)] md:p-10"
            style={{ border: `4px solid ${fg}` }}
          >
            {creation.type === "text" ? (
              <>
                <div className="reveal-emoji" aria-hidden>
                  {creation.emoji || "🎁"}
                </div>
                <p
                  className="mt-4 whitespace-pre-wrap break-words font-display text-2xl font-extrabold leading-snug md:text-4xl"
                  style={{ color: "#17151F" }}
                >
                  {creation.text}
                </p>
              </>
            ) : (
              <>
                {creation.hasImage ? (
                  <img
                    src={`/api/media/${creation.id}`}
                    alt={creation.caption ?? "Surprise"}
                    className="mx-auto w-full rounded-2xl object-contain"
                  />
                ) : (
                  <p className="py-16 text-midnight/40">Image indisponible.</p>
                )}
                {creation.caption && (
                  <p
                    className="mt-4 font-display text-xl font-extrabold"
                    style={{ color: "#17151F" }}
                  >
                    {creation.caption}
                  </p>
                )}
              </>
            )}
          </div>

          <p className="mt-4 text-center text-xs" style={{ color: `${fg}80` }}>
            Scanné {creation.views + 1} fois · disparaît le{" "}
            {new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "long",
            }).format(new Date(creation.expiresAt))}
          </p>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              href="/creer"
              className="btn btn-primary w-full max-w-xs"
              style={{ boxShadow: "4px 4px 0 rgba(23,21,31,0.25)" }}
            >
              Créer le mien
            </Link>
            <ReportButton id={creation.id} color={fg} />
          </div>

          <div className="mt-8">
            <AdSlot variant="reveal" />
          </div>

          <p className="mt-2 text-center text-[0.68rem]" style={{ color: `${fg}66` }}>
            OOPSQR · gratuit, sans compte · aucune publicité avant la surprise
          </p>
        </div>
      </div>
    </main>
  );
}
