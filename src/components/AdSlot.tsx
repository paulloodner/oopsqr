/**
 * Statistiques d'affichage des publicités.
 * Sans les variables d'environnement d'AdSense, un emplacement placeholder est
 * rendu : aucune publicité n'est chargée, la page reste intacte.
 */

import { AdsterraSlot } from "@/components/AdsterraSlot";

interface AdSlotProps {
  variant?: "home" | "library" | "editor" | "reveal" | "footer";
  className?: string;
}

export function AdSlot({ variant = "footer", className = "" }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME;
  const adsterraScript = process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT;
  const adsterraContainer = process.env.NEXT_PUBLIC_ADSTERRA_CONTAINER;

  if (!client && !slot && adsterraScript && adsterraContainer) {
    return <AdsterraSlot className={className} />;
  }

  if (!client || !slot) {
    return (
      <aside
        className={`ad-slot ${className}`}
        aria-label="Emplacement publicitaire"
        data-variant={variant}
      >
        <span className="ad-slot__tag">Publicité</span>
        <span className="ad-slot__hint">Emplacement réservé — non intrusif</span>
      </aside>
    );
  }

  return (
    <aside className={`ad-slot ${className}`} data-variant={variant}>
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
