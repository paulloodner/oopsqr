"use client";

import { useState } from "react";

import { resetConsent } from "@/lib/consent";

/**
 * Bouton « Préférences publicitaires » (pied de page).
 * Permet de revoir ou retirer son choix : le bandeau de consentement
 * réapparaît et, en cas de refus, les emplacements publicitaires disparaissent.
 */
export function ConsentPreferences() {
  const [done, setDone] = useState(false);

  function openPreferences() {
    resetConsent();
    setDone(true);
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={openPreferences}
        className="text-left underline decoration-cream/20 underline-offset-4 hover:text-lime"
      >
        Préférences publicitaires
      </button>
      {done && (
        <span role="status" className="text-cream/45">
          Choix rouvert ci-dessous.
        </span>
      )}
    </span>
  );
}
