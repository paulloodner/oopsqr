"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LibraryBig, Plus } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Accueil", Icon: Home },
  { href: "/bibliotheque", label: "Bibliothèque", Icon: LibraryBig },
  { href: "/creer", label: "Créer", Icon: Plus, primary: true },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav md:hidden" aria-label="Navigation mobile">
      {ITEMS.map(({ href, label, Icon, primary }) => {
        const active =
          primary
            ? pathname.startsWith("/creer")
            : href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

        if (primary) {
          return (
            <Link key={href} href={href} className="mobile-nav__create" aria-label="Créer un QR code">
              <span className="mobile-nav__create-btn">
                <Icon size={24} strokeWidth={2.6} />
              </span>
              <span className="mobile-nav__create-label">{label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={`mobile-nav__item ${active ? "mobile-nav__item--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
