import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatBytes, formatDateTime } from "@/lib/validation";
import { AdminCleanup } from "@/components/admin/AdminCleanup";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { AdminReports } from "@/components/admin/AdminReports";
import { AdminSurprises } from "@/components/admin/AdminSurprises";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const stats = await db.getStats();
  const creations = (await db.listCreations()).slice(0, 12);
  const reports = await db.listReports();
  const surprises = await db.listSurprises(false);

  const cards = [
    { label: "Créations totales", value: stats.totalCreations },
    { label: "Actives (14 j)", value: stats.activeCreations },
    { label: "Scans", value: stats.totalScans },
    { label: "Téléchargements", value: stats.totalDownloads },
    { label: "Signalements", value: stats.reports },
    { label: "Stockage utilisé", value: formatBytes(stats.storageBytes) },
  ];

  return (
    <main className="min-h-screen bg-midnight text-cream">
      <header className="border-b border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="brand text-xl text-cream">
              OOPS<em className="not-italic text-lime">QR</em>
            </Link>
            <span className="rounded-full border border-lime/30 bg-lime/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-lime">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="text-cream/50 hover:text-lime">
              Voir le site
            </Link>
            <Link href="/creer" className="text-cream/50 hover:text-lime">
              Créer
            </Link>
            <AdminLogout />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl text-cream">Tableau de bord</h1>
            <p className="mt-1 text-sm text-cream/45">
              Contenus, signalements et nettoyage automatique des expirations.
            </p>
          </div>
          <AdminCleanup />
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-cream/10 bg-white/[0.04] p-4"
            >
              <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-cream/40">
                {card.label}
              </p>
              <p className="mt-1 font-display text-3xl font-black text-cream">
                {card.value}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-cream/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-cream">
              Dernières créations
            </h2>
            <span className="text-[0.68rem] text-cream/35">12 plus récentes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cream/10 text-[0.62rem] uppercase tracking-[0.1em] text-cream/35">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Contenu</th>
                  <th className="py-2 pr-3">Créé</th>
                  <th className="py-2 pr-3">Expire</th>
                  <th className="py-2 pr-3">Scans</th>
                  <th className="py-2 pr-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {creations.map((creation) => (
                  <tr key={creation.id} className="border-b border-cream/5">
                    <td className="py-2 pr-3 font-mono text-[0.7rem] text-cream/60">
                      <Link href={`/s/${creation.id}`} target="_blank" className="hover:text-lime">
                        {creation.id}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-cream/55">{creation.type}</td>
                    <td className="max-w-[16rem] truncate py-2 pr-3 text-cream/70">
                      {creation.type === "text"
                        ? creation.text?.slice(0, 60)
                        : creation.caption || "(image)"}
                    </td>
                    <td className="py-2 pr-3 text-cream/45">
                      {formatDateTime(creation.createdAt)}
                    </td>
                    <td className="py-2 pr-3 text-cream/45">
                      {formatDateTime(creation.expiresAt)}
                    </td>
                    <td className="py-2 pr-3 text-cream/55">{creation.views}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase ${
                          creation.status === "active"
                            ? "bg-lime/15 text-lime"
                            : "bg-rose/15 text-rose"
                        }`}
                      >
                        {creation.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {creations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-cream/35">
                      Aucune création pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-cream/10 bg-white/[0.04] p-4">
            <h2 className="mb-3 font-display text-lg font-extrabold text-cream">
              Signalements
            </h2>
            <AdminReports initial={reports} />
          </section>

          <section className="rounded-2xl border border-cream/10 bg-white/[0.04] p-4">
            <h2 className="mb-3 font-display text-lg font-extrabold text-cream">
              Bibliothèque de surprises
            </h2>
            <AdminSurprises initial={surprises} />
          </section>
        </div>

        <p className="text-center text-[0.68rem] text-cream/25">
          Les contenus expirent après 14 jours. Un nettoyage opportuniste est aussi
          déclenché lors des nouvelles créations.
        </p>
      </div>
    </main>
  );
}
