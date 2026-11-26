"use client";

import { useEffect, useState } from "react";

import { AdSenseSlot } from "@/components/AdSenseSlot";
import { AdsterraSlot } from "@/components/AdsterraSlot";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

/**
 * Emplacements publicitaires.
 *
 * Règles :
 * - rien n'est affiché avant le consentement (ni pub, ni faux placeholder) ;
 * - si le consentement est refusé, l'emplacement disparaît totalement ;
 * - priorité AdSense, puis Adsterra (bannière native), sinon rien.
 */
export function AdSlot({
  variant = "footer",
  className = "",
}: {
  variant?: "home" | "library" | "editor" | "reveal" | "footer";
  className?: string;
}) {
  const [accepted, setAccepted] = useState(false);

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME;
  const adsterraScript = process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT;
  const adsterraContainer = process.env.NEXT_PUBLIC_ADSTERRA_CONTAINER;

  useEffect(() => {
    const sync = () => setAccepted(readConsent() === "accepted");
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!accepted) return null;

  if (client && slot) {
    return <AdSenseSlot client={client} slot={slot} variant={variant} className={className} />;
  }

  if (adsterraScript && adsterraContainer) {
    return <AdsterraSlot className={className} />;
  }

  return null;
}
