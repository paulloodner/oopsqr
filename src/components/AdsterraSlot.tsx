"use client";

import { useEffect, useState } from "react";

/**
 * Bannière native Adsterra (format discret, pas de popunder/push).
 * Chargée uniquement après consentement publicité (même clé que ConsentBanner).
 * Les identifiants viennent de NEXT_PUBLIC_ADSTERRA_SCRIPT / _CONTAINER.
 */
export function AdsterraSlot({ className = "" }: { className?: string }) {
  const [allowed, setAllowed] = useState(false);
  const script = process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT;
  const container = process.env.NEXT_PUBLIC_ADSTERRA_CONTAINER;

  useEffect(() => {
    try {
      setAllowed(window.localStorage.getItem("oopsqr-consent") === "accepted");
    } catch {
      setAllowed(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed || !script || !container) return;
    if (document.querySelector(`script[data-oopsqr-adsterra="${container}"]`)) return;
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = script;
    s.dataset.oopsqrAdsterra = container;
    document.head.appendChild(s);
  }, [allowed, script, container]);

  if (!script || !container) return null;

  return (
    <aside className={`ad-slot ${className}`} aria-label="Publicité">
      <span className="ad-slot__tag">Publicité</span>
      {allowed ? (
        <div id={container} />
      ) : (
        <span className="ad-slot__hint">Emplacement réservé — non intrusif</span>
      )}
    </aside>
  );
}
