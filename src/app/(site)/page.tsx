import Link from "next/link";
import { ArrowRight, Dices, Download, ImagePlus, Palette, ShieldCheck, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { SurpriseCard } from "@/components/SurpriseCard";
import { MiniCreator } from "@/components/MiniCreator";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const surprises = (await db.listSurprises()).slice(0, 6);

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-12 md:pb-24 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="hero__badge">
              <Sparkles size={13} strokeWidth={2.5} />
              100 % gratuit · sans compte
            </span>
            <h1 className="hero__title mt-5">
              Un QR code.
              <br />
              Une <span className="lime">surprise</span>.
              <br />
              Zéro compte.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-cream/70 md:text-lg">
              Cache une blague, un faux Wi-Fi ou une photo derrière un QR code.
              Ton pote scanne, il découvre. Toi, tu savoures.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-cream/55">
              <span>✓ Sans inscription</span>
              <span>✓ Prêt en 10 secondes</span>
              <span>✓ PNG, SVG, PDF</span>
            </div>
          </div>

          <div className="hero-creator mx-auto mt-9 max-w-5xl md:mt-12">
            <MiniCreator surprises={surprises} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/creer" className="btn btn-secondary border-cream/20 bg-transparent text-cream">
              Ouvrir l’éditeur complet
              <ArrowRight size={17} />
            </Link>
            <Link href="/bibliotheque" className="btn btn-ghost text-cream/75">
              <Dices size={17} />
              Piocher une surprise
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden>
        <div className="marquee__inner">
          {Array.from({ length: 2 }).map((_, loop) => (
            <span key={loop}>
              &nbsp; Scan · Ris · Partage · Faux Wi-Fi · Messages secrets · Photos
              surprises · Aucune inscription · 14 jours · Scan · Ris · Partage ·
              Faux Wi-Fi · Messages secrets · Photos surprises · Aucune
              inscription · 14 jours &nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* COMMENT */}
      <section id="comment" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-violet-deep">
              Simple comme une blague
            </p>
            <h2 className="mt-2 text-4xl md:text-5xl">Trois étapes, zéro friction.</h2>
          </div>
          <p className="max-w-xs text-sm text-midnight/50">
            Pas de tutoriel, pas de compte, pas d&apos;application. Le chemin le
            plus court entre une idée et un fou rire.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "01",
              title: "Choisis ta surprise",
              text: "Une blague de la bibliothèque, ton propre texte ou une image. Tout est personnalisable.",
              emoji: "🎲",
            },
            {
              n: "02",
              title: "Personnalise le QR",
              text: "Couleurs, formes, textes, logo central. L'aperçu est en direct et le contraste vérifié.",
              emoji: "🎨",
            },
            {
              n: "03",
              title: "Télécharge et colle",
              text: "Export PNG, SVG ou PDF prêt à imprimer. Colle-le, scanne-le, savoure.",
              emoji: "🖨️",
            },
          ].map((step) => (
            <article key={step.n} className="feature-card relative overflow-hidden">
              <span className="step-number">{step.n}</span>
              <span className="absolute right-4 top-4 text-3xl">{step.emoji}</span>
              <h3 className="mt-4 text-xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-midnight/55">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* LIBRARY PREVIEW */}
      <section className="border-y border-midnight/10 bg-white/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-violet-deep">
                Prêtes à scanner
              </p>
              <h2 className="mt-2 text-3xl md:text-4xl">La bibliothèque officielle des mauvaises surprises.</h2>
            </div>
            <Link href="/bibliotheque" className="btn btn-secondary btn-sm">
              Tout voir
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {surprises.map((surprise, index) => (
              <SurpriseCard key={surprise.id} surprise={surprise} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-violet-deep">
              Sous le capot
            </p>
            <h2 className="mt-2 text-4xl md:text-5xl">
              Léger à utiliser.
              <br />
              Sérieux à l&apos;intérieur.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-midnight/55">
              OOPSQR gère les limites techniques du QR code pour toi : capacité,
              lisibilité, compression et expiration. Tu ne vois que le fun.
            </p>
            <Link href="/creer" className="btn btn-violet mt-6">
              Essayer maintenant
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                Icon: ArrowRight,
                title: "Deux modes",
                text: "Lien connecté avec page de révélation, ou texte encodé directement pour marcher sans Internet.",
              },
              {
                Icon: ImagePlus,
                title: "Images optimisées",
                text: "Recadrage, compression et conversion automatiques. Même une photo de 5 Mo devient légère.",
              },
              {
                Icon: ShieldCheck,
                title: "Lisibilité contrôlée",
                text: "Contraste, zone de silence et niveau de correction d'erreur vérifiés avant l'export.",
              },
              {
                Icon: Sparkles,
                title: "14 jours, pas plus",
                text: "Les contenus connectés expirent et sont supprimés automatiquement. Aucun compte, aucune identité demandée.",
              },
              {
                Icon: Download,
                title: "Exports propres",
                text: "PNG haute résolution, SVG vectoriel et PDF prêt à imprimer, avec formats d'affiche.",
              },
              {
                Icon: Palette,
                title: "Sans compte",
                text: "Aucun email, aucune inscription, aucun mot de passe. Tu crées, tu télécharges, c'est fini.",
              },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="feature-card">
                <span className="feature-card__icon" aria-hidden>
                  <Icon size={21} strokeWidth={2.2} />
                </span>
                <h3 className="mt-2 text-lg">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-midnight/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        <AdSlot variant="home" />
      </div>

      {/* FAQ */}
      <section id="questions" className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="text-center">
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-violet-deep">
            Bon à savoir
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl">Les questions qui reviennent.</h2>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {[
            {
              q: "Faut-il créer un compte ?",
              a: "Non. Tu écris, tu personalises, tu télécharges. Aucun email ni mot de passe.",
            },
            {
              q: "Que se passe-t-il après 14 jours ?",
              a: "Les contenus connectés sont supprimés. Les QR hors ligne, eux, continuent de fonctionner.",
            },
            {
              q: "Puis-je mettre une image ?",
              a: "Oui. JPG, PNG et WebP sont recadrés et compressés automatiquement avant l’envoi.",
            },
            {
              q: "Le QR reste-t-il lisible ?",
              a: "Oui : contraste, zone de silence et correction d’erreur sont vérifiés avant l’export.",
            },
          ].map((item) => (
            <details key={item.q} className="faq-card">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="cta-band relative overflow-hidden px-6 py-12 md:px-14 md:py-16">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-lime">
                Prêt à piéger quelqu&apos;un ?
              </p>
              <h2 className="mt-2 max-w-xl text-4xl md:text-5xl">
                La meilleure blague est celle qu&apos;on scanne.
              </h2>
            </div>
            <Link href="/creer" className="btn btn-primary px-7 py-4 text-lg">
              Créer mon QR code
            </Link>
          </div>
          <p className="mt-6 text-xs text-cream/35">
            Gratuit · Sans inscription · Publicités discrètes uniquement
          </p>
        </div>
      </section>
    </main>
  );
}
