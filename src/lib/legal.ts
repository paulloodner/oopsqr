/**
 * Identité légale du service — source unique de vérité.
 *
 * Cadre : loi n° 2004-575 du 21 juin 2004 (LCEN), art. 1-1 et 1-2,
 * dans sa rédaction issue de la loi SREN n° 2024-449 du 21 mai 2024.
 *
 * - Éditeur : personne physique NOMMÉE éditant à titre NON PROFESSIONNEL
 *   (art. 1-1 LCEN). Nom + email publiés ; directeur de publication = éditeur.
 * - Hébergeur : OBLIGATOIREMENT publié (nom/dénomination + adresse, art. 1-1).
 *   Renseigner `host` avant toute mise en ligne publique. Tant qu'il est null,
 *   la page affiche un avis honnête.
 *
 * ⚠️ Si le service devient professionnel (contrepartie économique, publicités
 * rémunérées, vente…), compléter l'identification (domicile, téléphone,
 * immatriculation le cas échéant) conformément à l'art. 1-1 I.
 */

export interface LegalHost {
  name: string;
  address: string;
  phone?: string;
  website?: string;
}

export const LEGAL = {
  contactEmail: "coffigildas268@gmail.com",
  lastUpdated: "novembre 2026",

  editor: {
    kind: "particulier-non-professionnel" as const,
    anonymous: false,
    name: "COFFI Gildas Loîc Paulin",
    email: "coffigildas268@gmail.com",
  },

  /** À renseigner au déploiement (obligation art. 1-1 II LCEN). */
  host: null as LegalHost | null,

  /**
   * Hébergeurs gratuits vérifiés (nov. 2026) compatibles avec un projet
   * personnel ; l'identité légale de chacun est prête à être copiée dans `host`.
   * Voir README §5 pour le comparatif et les limites (usage commercial / pub).
   */
  hostCandidates: [
    {
      id: "oracle",
      name: "Oracle Corporation",
      address: "500 Oracle Parkway, Redwood Shores, CA 94065, États-Unis",
      website: "https://www.oracle.com/cloud/",
      note: "Always Free : VPS persistant, adapté à Node + SQLite.",
    },
    {
      id: "cloudflare",
      name: "Cloudflare, Inc.",
      address: "101 Townsend Street, San Francisco, CA 94107, États-Unis",
      website: "https://www.cloudflare.com/",
      note: "Pages/Workers : bande passante illimitée ; nécessite d'adapter la persistance.",
    },
    {
      id: "netlify",
      name: "Netlify, Inc.",
      address: "44 Montgomery Street, Suite 300, San Francisco, CA 94104, États-Unis",
      website: "https://www.netlify.com/",
      note: "Free : 300 crédits/mois ; fonctions serverless, persistance à externaliser.",
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
