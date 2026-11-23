/**
 * Statistiques d'affichage des publicités.
 * Sans les variables d'environnement d'AdSense, un emplacement placeholder est
 * rendu : aucune publicité n'est chargée, la page reste intacte.
 */

interface AdSlotProps {
  variant?: "home" | "library" | "editor" | "reveal" | "footer";
  className?: string;
}

export function AdSlot({ variant = "footer", className = "" }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME;

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
