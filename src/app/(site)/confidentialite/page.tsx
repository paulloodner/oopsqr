import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "Comment OOPSQR limite la collecte de données : pas de compte, contenus 14 jours, publicités avec consentement.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-violet-deep">
        Vie privée
      </p>
      <h1 className="mt-2 text-4xl md:text-5xl">Confidentialité</h1>
      <p className="mt-3 text-sm text-midnight/45">Dernière mise à jour : novembre 2026</p>

      <div className="mt-8 space-y-7 text-sm leading-relaxed text-midnight/70">
        <section>
          <h2 className="text-xl text-midnight">Le principe : collecter le minimum</h2>
          <p className="mt-2">
            Créer un QR code ne demande ni compte, ni email, ni numéro de téléphone.
            Nous ne cherchons pas à identifier les personnes qui scannent. Les
            statistiques affichées sont anonymisées (nombre de scans, téléchargements
            et créations).
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Contenus et conservation</h2>
          <p className="mt-2">
            Les contenus connectés (texte, emoji, légende, image) sont stockés sur
            notre infrastructure cloud pendant <strong>14 jours</strong>. À l&apos;expiration,
            le contenu (texte, emoji, légende, image) est <strong>physiquement effacé
            de la base de données</strong> et le lien de révélation devient invalide.
            Seules les métadonnées techniques nécessaires à la gestion (identifiant,
            dates, compteurs) peuvent être conservées jusqu&apos;à 30 jours après
            expiration, puis purgées. La purge est déclenchée par l&apos;activité du
            site (au moins une fois par 24 h) et peut aussi être lancée manuellement
            depuis l&apos;espace d&apos;administration.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Données techniques</h2>
          <p className="mt-2">
            Pour lutter contre les abus, un identifiant technique dérivé de
            l&apos;adresse IP (haché et tronqué) peut être utilisé de façon temporaire
            pour limiter le nombre de créations. Aucune adresse IP brute n&apos;est
            enregistrée dans la base de contenus. Aucune donnée n&apos;est revendue.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Cookies et publicité</h2>
          <p className="mt-2">
            Sans consentement, seul le cookie de session administrateur est
            utilisé ; ton choix publicitaire est conservé dans le
            <strong> stockage local de ton navigateur</strong> (clé
            <code>oopsqr-consent</code> en <code>localStorage</code>, ce n&apos;est
            pas un cookie). Les emplacements publicitaires sont discrets et placés
            après le contenu de révélation. Si tu acceptes la publicité, le
            fournisseur publicitaire peut déposer des cookies de mesure ou de
            personnalisation. Tu peux refuser : le service reste entièrement
            fonctionnel. Tu peux aussi <strong>modifier ou retirer ton choix à tout
            moment</strong> via « Préférences publicitaires » dans le pied de page :
            le bandeau de consentement réapparaît et, en cas de refus, les
            emplacements publicitaires disparaissent.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Sécurité et signalements</h2>
          <p className="mt-2">
            Les fichiers importés sont contrôlés (format, type réel, taille) et les
            textes assainis. Les contenus manifestement abusifs peuvent être retirés
            après signalement. Un lien de signalement est présent sur chaque page de
            révélation.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Hébergement, base de données et régie</h2>
          <p className="mt-2">
            Le service s&apos;appuie sur des prestataires techniques situés
            hors de l&apos;Union européenne (États-Unis, et Jamaica pour la
            régie publicitaire), ce qui peut impliquer un transfert de données
            hors UE. Les polices Google Fonts sont chargées au premier affichage,
            avant tout choix publicitaire ; les autres services tiers publicitaires
            ne sont contactés qu&apos;après acceptation :
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {LEGAL.partners.map((partner) => (
              <li key={partner.id}>
                <strong>{partner.name}</strong> — {partner.role}.{" "}
                <a className="underline" href={partner.website} rel="noreferrer">
                  {partner.website.replace(/^https?:\/\//, "")}
                </a>{" "}
                — {partner.address}.
              </li>
            ))}
          </ul>
          <p className="mt-2">
            OOPSQR ne transmet aucune donnée personnelle à la régie publicitaire :
            le partenaire dépose lui-même ses propres cookies dans votre
            navigateur, et uniquement après votre acceptation. Les contenus
            connectés ne sont visibles que par les personnes disposant du lien
            correspondant.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Tes droits</h2>
          <p className="mt-2">
            Les contenus n&apos;étant liés à aucune identité, nous ne pouvons pas
            retrouver une création à partir d&apos;une personne. Pour toute question
            relative aux données personnelles :{" "}
            <a className="underline" href={`mailto:${LEGAL.contactEmail}`}>
              {LEGAL.contactEmail}
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/mentions-legales" className="btn btn-secondary btn-sm">
          Mentions légales
        </Link>
        <Link href="/creer" className="btn btn-primary btn-sm">
          Créer un QR
        </Link>
      </div>
    </main>
  );
}
