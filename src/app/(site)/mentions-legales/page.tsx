import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Informations légales relatives au service OOPSQR : éditeur, hébergeur, propriété intellectuelle, responsabilité et signalement.",
};

export default function LegalPage() {
  const host = LEGAL.host;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-violet-deep">
        Informations légales
      </p>
      <h1 className="mt-2 text-4xl md:text-5xl">Mentions légales</h1>
      <p className="mt-3 text-sm text-midnight/45">
        Dernière mise à jour : {LEGAL.lastUpdated}
      </p>

      <div className="mt-8 space-y-7 text-sm leading-relaxed text-midnight/70">
        <section>
          <h2 className="text-xl text-midnight">Éditeur du site</h2>
          <p className="mt-2">
            Le service OOPSQR est édité par{" "}
            <strong>{LEGAL.editor.name}</strong>, personne physique éditant à titre{" "}
            <strong>non professionnel</strong>, conformément à la loi n° 2004-575 du
            21 juin 2004 pour la confiance dans l&apos;économie numérique (LCEN),
            article 1-1, dans sa rédaction issue de la loi n° 2024-449 du 21 mai 2024.
          </p>
          <p className="mt-2">
            Contact et notification :{" "}
            <a className="underline" href={`mailto:${LEGAL.editor.email}`}>
              {LEGAL.editor.email}
            </a>
            . Toute demande relative à un contenu, à un droit de propriété
            intellectuelle ou à une réclamation peut être adressée à cette adresse ;
            l&apos;éditeur y répond et, le cas échéant, saisit l&apos;hébergeur ou
            l&apos;autorité compétente.
          </p>
          <p className="mt-2 text-xs text-midnight/50">
            Directeur de la publication : {LEGAL.editor.name}.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Hébergeur</h2>
          {host ? (
            <p className="mt-2">
              Le service est hébergé par <strong>{host.name}</strong>,{" "}
              {host.address}
              {host.phone ? (
                <>
                  {" "}
                  — téléphone : {host.phone}
                </>
              ) : null}
              {host.website ? (
                <>
                  {" "}
                  —{" "}
                  <a className="underline" href={host.website} rel="noreferrer">
                    {host.website.replace(/^https?:\/\//, "")}
                  </a>
                </>
              ) : null}
              . L&apos;éditeur a communiqué à cet hébergeur l&apos;ensemble de ses
              éléments d&apos;identification personnelle, conformément à l&apos;article
              1-1, II, de la LCEN.
            </p>
          ) : (
            <p className="mt-2 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-amber-900">
              L&apos;hébergeur du service n&apos;est pas encore arrêté. Conformément à
              l&apos;article 1-1, II, de la LCEN, son nom (ou sa dénomination sociale) et
              son adresse seront publiés ici, et l&apos;identité de l&apos;éditeur lui aura
              été communiquée, <strong>avant toute mise en ligne publique</strong> du
              service.
            </p>
          )}
        </section>

        <section>
          <h2 className="text-xl text-midnight">Objet du service</h2>
          <p className="mt-2">
            OOPSQR permet de créer gratuitement des QR codes renvoyant vers un contenu
            humoristique, une image ou un message personnel. Le service est accessible
            sans création de compte. Les contenus connectés sont conservés pendant
            14 jours, puis supprimés automatiquement ; les QR codes « hors ligne »
            encodent directement le texte et ne dépendent d&apos;aucun serveur.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Responsabilité</h2>
          <p className="mt-2">
            L&apos;utilisateur est seul responsable des contenus qu&apos;il crée et
            diffuse. Il s&apos;engage à ne pas utiliser le service pour usurper une
            identité, imiter une page de connexion, collecter des identifiants, diffuser
            des logiciels malveillants ou porter atteinte à des tiers. Tout contenu
            signalé peut être retiré sans préavis. L&apos;éditeur ne peut être tenu
            responsable des contenus créés par les utilisateurs ni de l&apos;usage qui
            est fait des QR codes une fois imprimés ou partagés.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Signalement et notification</h2>
          <p className="mt-2">
            Un bouton de signalement est disponible sur chaque page de révélation.
            Les signalements sont examinés depuis l&apos;espace d&apos;administration.
            Pour toute notification urgente (contenu illicite, atteinte à un droit) :{" "}
            <a className="underline" href={`mailto:${LEGAL.contactEmail}`}>
              {LEGAL.contactEmail}
            </a>
            . Conformément à la LCEN, l&apos;hébergeur peut être saisi aux fins de retrait
            des contenus manifestement illicites.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Propriété intellectuelle</h2>
          <p className="mt-2">
            La marque OOPSQR, le logo et l&apos;interface sont protégés. Les contenus
            créés par les utilisateurs restent la propriété de leurs auteurs, qui
            garantissent détenir les droits nécessaires à leur diffusion. Les icônes
            sont issues de la bibliothèque Lucide (licence ISC) ; les polices Outfit et
            Inter sont distribuées sous licence SIL Open Font License.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Données personnelles et publicité</h2>
          <p className="mt-2">
            Le service ne demande aucun compte et limite la collecte au strict
            nécessaire (voir la{" "}
            <Link className="underline" href="/confidentialite">
              politique de confidentialité
            </Link>
            ). Le service est financé par des emplacements publicitaires discrets,
            soumis à consentement ; aucune publicité n&apos;est affichée avant la
            révélation d&apos;une surprise et aucune fenêtre bloquante n&apos;est utilisée.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-midnight">Droit applicable</h2>
          <p className="mt-2">
            Les présentes mentions sont régies par le droit français. À défaut de
            résolution amiable, tout litige relève des juridictions françaises
            compétentes.
          </p>
        </section>
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/confidentialite" className="btn btn-secondary btn-sm">
          Confidentialité
        </Link>
        <Link href="/creer" className="btn btn-primary btn-sm">
          Créer un QR
        </Link>
      </div>
    </main>
  );
}
