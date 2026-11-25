/**
 * Identité légale du service — source unique de vérité.
 *
 * Cadre : loi n° 2004-575 du 21 juin 2004 (LCEN), art. 1-1 et 1-2,
 * dans sa rédaction issue de la loi SREN n° 2024-449 du 21 mai 2024.
 *
 * - Éditeur : personne physique NOMMÉE, non anonyme (art. 1-1 LCEN). Le service
 *   est GRATUIT pour les utilisateurs et financé par la publicité (régie
 *   Adsterra, bannières soumises à consentement). Nom, email, téléphone /
 *   WhatsApp et pays de résidence sont publiés ; directeur de publication =
 *   éditeur.
 * - Hébergeur : OBLIGATOIREMENT publié (nom/dénomination + adresse, art. 1-1).
 *   Renseigner `host` avant toute mise en ligne publique. Tant qu'il est null,
 *   la page affiche un avis honnête.
 *
 * ⚠️ Le service étant financé par des publicités rémunérées, les coordonnées
 *   de l'éditeur sont publiées (email + téléphone + pays). Si l'activité
 *   devient une véritable activité PROFESSIONNELLE, compléter avec l'adresse
 *   postale du domicile et l'immatriculation le cas échéant (art. 1-1, I).
 */

export interface LegalHost {
  name: string;
  address: string;
  phone?: string;
  website?: string;
}

export const LEGAL = {
  contactEmail: "paulloodner@gmail.com",
  lastUpdated: "novembre 2026",

  editor: {
    /** Personne physique, identité publique (service gratuit financé par la pub). */
    kind: "particulier" as const,
    anonymous: false,
    name: "Paul Paulin",
    email: "paulloodner@gmail.com",
    /** Téléphone / WhatsApp publié pour les notifications (art. 1-1, I, LCEN). */
    phone: "+229 01 65 24 06 54",
    /** Pays de résidence (domicile) — art. 1-1, I, LCEN. */
    domicile: "Bénin",
  },

  /**
   * Hébergeur effectif du service (art. 1-1, II, LCEN).
   * Render Services, Inc. — identité et adresse vérifiées dans les Conditions
   * générales de Render (version du 10 juillet 2026) et le Data Privacy
   * Framework (US Department of Commerce).
   */
  host: {
    name: "Render Services, Inc.",
    address: "525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis",
    website: "https://render.com/",
  } as LegalHost,

  /**
   * Sous-traitants et partenaires techniques (à publier dans la politique de
   * confidentialité : hébergement, base de données, régie publicitaire).
   */
  partners: [
    {
      id: "render",
      role: "Hébergement de l'application (serveurs, déploiement, TLS)",
      name: "Render Services, Inc.",
      address: "525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis",
      website: "https://render.com/",
    },
    {
      id: "neon",
      role: "Base de données (contenus des QR codes, expiration 14 jours)",
      name: "Neon Inc.",
      address: "2088 University Avenue, Palo Alto, CA 94301, États-Unis",
      website: "https://neon.tech/",
    },
    {
      id: "google-fonts",
      role: "Polices de caractères (Google Fonts, chargées au premier affichage des pages)",
      name: "Google LLC",
      address: "1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis",
      website: "https://fonts.google.com/",
    },
    {
      id: "adsterra",
      role: "Régie publicitaire (bannières soumises à consentement)",
      name: "Adsterra (KeepSolid)",
      address: "Brink House, 1 Customs Street, Kingston, Jamaica",
      website: "https://www.adsterra.com/",
    },
  ] as Array<{
    id: string;
    role: string;
    name: string;
    address: string;
    website: string;
  }>,

  /**
   * Hébergeurs alternatifs (si changement d'hébergeur) — l'identité légale de
   * chacun est prête à être recopiée dans `host`.
   */
  hostCandidates: [
    {
      id: "render",
      name: "Render Services, Inc.",
      address: "525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis",
      website: "https://render.com/",
      note: "Hébergeur retenu : Web Service Free, compatible usage commercial et publicité.",
    },
    {
      id: "oracle",
      name: "Oracle Corporation",
      address: "500 Oracle Parkway, Redwood Shores, CA 94065, États-Unis",
      website: "https://www.oracle.com/cloud/",
      note: "Always Free : VPS persistant, sans cold-start (alternative à Render).",
    },
    {
      id: "cloudflare",
      name: "Cloudflare, Inc.",
      address: "101 Townsend Street, San Francisco, CA 94107, États-Unis",
      website: "https://www.cloudflare.com/",
      note: "Workers/Pages : bande passante illimitée ; nécessite d'adapter le runtime.",
    },
    {
      id: "ovh",
      name: "OVH SAS",
      address: "2 rue Kellermann, 59100 Roubaix, France",
      phone: "+33 9 72 10 10 07",
      website: "https://www.ovhcloud.com/",
      note: "Offres d'entrée payantes mais hébergement France/EU.",
    },
  ] as Array<LegalHost & { id: string; note: string }>,
};
