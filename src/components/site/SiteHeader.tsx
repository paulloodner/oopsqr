import Link from "next/link";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="OOPSQR, accueil">
          <img
            src="/brand/icon-192.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg"
          />
          <span>
            OOPS<em>QR</em>
          </span>
        </Link>

        <nav className="site-nav hidden md:flex" aria-label="Navigation principale">
          <Link href="/bibliotheque">Bibliothèque</Link>
          <Link href="/#comment">Comment ça marche</Link>
          <Link href="/#questions">Questions</Link>
          <Link href="/creer">Créer</Link>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full border border-lime/30 bg-lime/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-lime sm:inline-flex md:hidden">
            <Sparkles size={11} />
            Gratuit
          </span>
          <Link href="/creer" className="btn btn-primary btn-sm hidden md:inline-flex">
            Créer mon QR
          </Link>
        </div>
      </div>
    </header>
  );
}
