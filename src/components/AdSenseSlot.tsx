"use client";

import { useEffect } from "react";

import { CONSENT_EVENT, readConsent } from "@/lib/consent";

/**
 * Bloc AdSense, chargé uniquement après consentement.
 *
 * Avant ce composant, le script n'était injecté qu'au clic « Accepter » : un
 * visiteur déjà consentant voyait un <ins> vide. Ici, le script est chargé dès
 * que le consentement est accepté (visite courante ou précédente) et le bloc
 * est initialisé via `adsbygoogle.push({})` une fois le script chargé.
 */
export function AdSenseSlot({
  client,
  slot,
  variant = "footer",
  className = "",
}: {
  client: string;
  slot: string;
  variant?: "home" | "library" | "editor" | "reveal" | "footer";
  className?: string;
}) {
  useEffect(() => {
    const load = () => {
      if (readConsent() !== "accepted") return;
      if (document.querySelector("script[data-oopsqr-ads]")) return;
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      script.crossOrigin = "anonymous";
      script.dataset.oopsqrAds = "true";
      script.onload = () => {
        try {
          const w = window as unknown as { adsbygoogle?: unknown[] };
          (w.adsbygoogle = w.adsbygoogle || []).push({});
        } catch {
          // Bloqueur de pub ou API indisponible : l'emplacement reste vide.
        }
      };
      document.head.appendChild(script);
    };

    load();
    const onConsentChange = () => load();
    window.addEventListener(CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange);
  }, [client]);

  return (
    <aside className={`ad-slot ${className}`} data-variant={variant} aria-label="Publicité">
      <span className="ad-slot__tag">Publicité</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
