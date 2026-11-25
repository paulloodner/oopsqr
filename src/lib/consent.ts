/**
 * Consentement publicitaire — source unique de vérité (client uniquement).
 *
 * - Stockage : localStorage (aucun cookie tiers avant accord)
 * - Notification : CustomEvent pour rejouer la décision en direct dans les
 *   emplacements publicitaires (pas besoin de recharger la page)
 */

export const CONSENT_KEY = "oopsqr-consent";
export const CONSENT_EVENT = "oopsqr-consent-change";

export type ConsentValue = "accepted" | "refused";

export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "refused" ? value : null;
  } catch {
    return null;
  }
}

/**
 * Retrait du consentement (droit RGPD : le refus/retrait doit être aussi
 * simple que l'acceptation). Efface la décision stockée et notifie les
 * emplacements : le bandeau réapparaît et les pubs disparaissent.
 */
export function resetConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // stockage indisponible : l'événement suffit pour la session
  }
  window.dispatchEvent(
    new CustomEvent(CONSENT_EVENT, { detail: { consent: null } })
  );
}

export function writeConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // stockage indisponible : la décision reste valable pour la session
  }
  window.dispatchEvent(
    new CustomEvent(CONSENT_EVENT, { detail: { consent: value } })
  );
}
