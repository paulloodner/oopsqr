"use client";

import { useEffect } from "react";

import { CONSENT_EVENT, readConsent } from "@/lib/consent";

/**
 * Bannière native Adsterra (format discret, pas de popunder/push).
 * Le script n'est chargé qu'après consentement explicite ; le composant est
 * rendu par `AdSlot`, qui applique la même règle.
 */
export function AdsterraSlot({ className = "" }: { className?: string }) {
  const script = process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT;
  const container = process.env.NEXT_PUBLIC_ADSTERRA_CONTAINER;

  useEffect(() => {
    if (!script || !container) return;

    // Chargement si le consentement a déjà été donné lors d'une visite précédente.
    if (readConsent() === "accepted") loadAdsterra(script, container);

    // Activation immédiate quand l'utilisateur clique sur « Accepter ».
    const onConsentChange = () => {
      if (readConsent() === "accepted") loadAdsterra(script, container);
    };
    window.addEventListener(CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange);
  }, [script, container]);

  if (!script || !container) return null;

  return (
    <aside className={`ad-slot ${className}`} aria-label="Publicité">
      <span className="ad-slot__tag">Publicité</span>
      <div id={container} />
    </aside>
  );
}

/** Le script est injecté une seule fois, uniquement si le consentement vaut "accepted". */
function loadAdsterra(script: string, container: string) {
  if (document.querySelector(`script[data-oopsqr-adsterra="${container}"]`)) return;
  const s = document.createElement("script");
  s.async = true;
  s.setAttribute("data-cfasync", "false");
  s.src = script;
  s.dataset.oopsqrAdsterra = container;
  document.head.appendChild(s);
}
