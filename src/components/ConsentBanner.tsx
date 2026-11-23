"use client";

import { useEffect, useState } from "react";

const KEY = "oopsqr-consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setVisible(true);
    } catch {
      // stockage indisponible : on n'affiche pas la bannière
    }
  }, []);

  function choose(value: "accepted" | "refused") {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      // ignore
    }
    setVisible(false);
    if (value === "accepted") loadAds();
  }

  function loadAds() {
    const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
    if (!client) return;
    if (document.querySelector("script[data-oopsqr-ads]")) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.crossOrigin = "anonymous";
    script.dataset.oopsqrAds = "true";
    document.head.appendChild(script);
  }

  if (!visible) return null;

  return (
    <div className="consent" role="dialog" aria-label="Consentement publicité">
      <p className="font-display text-sm font-extrabold text-cream">
        Une pub discrète finance OOPSQR
      </p>
      <p className="mt-1 text-xs leading-relaxed text-cream/60">
        On utilise des publicités non intrusives pour garder le service gratuit.
        Aucune pub ne s&apos;affiche avant ta surprise. Tu peux refuser : tout
        continuera de fonctionner.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-full border border-cream/20 px-3 py-2 text-xs font-bold text-cream/80 hover:border-cream/50"
          onClick={() => choose("refused")}
        >
          Refuser
        </button>
        <button
          type="button"
          className="flex-1 rounded-full bg-lime px-3 py-2 text-xs font-extrabold text-midnight hover:brightness-105"
          onClick={() => choose("accepted")}
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
