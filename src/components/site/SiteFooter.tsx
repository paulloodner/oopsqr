import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <img
              src="/brand/icon-192.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg"
            />
            <span className="brand text-xl text-cream">
              OOPS<em className="not-italic text-lime">QR</em>
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/55">
            Des QR codes qui cachent une blague, un message ou une image. Gratuit,
            sans compte, et un peu malicieux.
          </p>
        </div>

        <div>
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.14em] text-cream/40">
            Le produit
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/creer">Créer un QR code</Link>
            </li>
            <li>
              <Link href="/bibliotheque">Bibliothèque</Link>
            </li>
            <li>
              <Link href="/#comment">Comment ça marche</Link>
            </li>
            <li>
              <Link href="/creer">Mode hors ligne</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.14em] text-cream/40">
            Infos
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/mentions-legales">Mentions légales</Link>
            </li>
            <li>
              <Link href="/confidentialite">Confidentialité</Link>
            </li>
            <li>
              <a href={`mailto:${LEGAL.contactEmail}`}>Contact</a>
            </li>
            <li>
              <Link href="/admin/login" className="text-cream/35">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-2 border-t border-cream/10 pt-5 text-xs text-cream/35 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} OOPSQR. Fait avec malice.</p>
        <p>
          Contenus connectés conservés 14 jours · Aucune donnée personnelle demandée.
        </p>
      </div>
    </footer>
  );
}
