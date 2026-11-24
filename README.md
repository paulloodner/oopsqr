# OOPSQR

> **En production** : <https://oopsqr.onrender.com> — Render Free (plan `Free`,
> région Frankfurt) · Neon Postgres (plan Free, Francfort) · dépôt GitHub
> `paulloodner/oopsqr` · déploiement automatique désactivé (repo public connecté
> par URL : chaque push demande un *Manual Deploy* depuis le dashboard Render).

Plateforme web gratuite de création de **QR codes surprises** : une blague, un faux
Wi‑Fi, un message secret ou une image cachés derrière un QR code. Sans compte,
sans application, avec publicités discrètes et contenus connectés conservés
**14 jours**.

- Stack : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
  **Neon Postgres** (`@neondatabase/serverless`) · `qrcode` · `jsPDF` ·
  `lucide-react`.
- Déploiement : Render Free (Web Service) · Base : Neon Free · Publicité :
  Adsterra Native Banner (consent-gated).
- Cahier des charges : [`OOPSQR.txt`](./OOPSQR.txt) · Identité : [`TYPOGRAPHIE.txt`](./TYPOGRAPHIE.txt).

---

## 1. Démarrage rapide

```bash
npm install
cp .env.example .env.local   # puis renseigner les secrets (voir §3)
npm run dev                  # http://localhost:3000
```

> **Note Windows / cette machine :** `npm run dev` et `npm run build` passent par
> `scripts/next.cjs`, qui force **Webpack** (Turbopack exige des bindings SWC
> natifs invalides ici) et applique `scripts/patch-fs.cjs` (normalise `readlink`
> `EISDIR` → `EINVAL`). Ne pas lancer `next` directement.

Production :

```bash
npm run build
npm run start                # ou: node scripts/next.cjs start
npm run typecheck            # tsc --noEmit
```

La base SQLite et les uploads sont créés automatiquement dans `data/`
(`DATA_DIR` pour changer). Au premier démarrage, 20 surprises sont injectées
depuis `src/lib/seed-surprises.ts`.

---

## 2. Parcours produit

| Route | Rôle |
|---|---|
| `/` | Accueil + **simulateur express** (aperçu live, PNG immédiat, sans redirection) |
| `/bibliotheque` | Bibliothèque administrable : recherche, filtres par catégorie, aperçu en modale |
| `/creer` | Éditeur complet : bibliothèque / texte / image, recadrage, compression, styles, logo, icônes de texte, aperçu live, exports |
| `/s/[id]` | Page de révélation (mobile first, aucune pub avant la surprise) |
| `/admin`, `/admin/login` | Back‑office protégé : stats, créations, signalements, CRUD surprises, nettoyage |
| `/mentions-legales`, `/confidentialite` | Pages légales |

Modes de génération :

- **Connecté** : le contenu est stocké, le QR encode `/s/<id>` ; expire à 14 jours.
- **Hors ligne** : le texte brut est encodé dans le QR (aucun envoi de données).
  Les images hors ligne ne sont **pas** promises (capacité/lecteurs non garantis).

Exports : **PNG** haute résolution, **SVG** vectoriel, **PDF** avec presets
d’impression (étiquette 10×7, badge 8,5×5,5, A6, A5, A4, A3, carré social,
Story 9:16, planche A4 ×12 avec traits de coupe).

Icônes de texte : 12 icônes vectorielles placées **à côté** du libellé supérieur
ou inférieur, hors zone de silence, rendues à l’identique en SVG et en PNG.
Le logo central reste une option distincte (correction d’erreur portée à H).

---

## 3. Variables d’environnement

Voir [`.env.example`](./.env.example).

| Variable | Obligatoire en prod | Rôle |
|---|---|---|
| `DATABASE_URL` | **oui** | Postgres managé Neon (chaine `postgres://…?sslmode=require`) |
| `ADMIN_PASSWORD` | **oui** | Mot de passe admin (défaut dev : `oopsqr-admin`) |
| `ADMIN_SECRET` | **oui** | Secret HMAC du cookie admin (chaîne aléatoire longue) |
| `CRON_SECRET` | recommandé | Bearer token de `/api/cleanup` (purge manuelle ou cron externe) |
| `NEXT_PUBLIC_SITE_URL` | recommandé | Origine publique encodée dans les QR connectés |
| `NODE_VERSION` | recommandé | Version Node de référence (`22.x`) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` / `..._SLOT_HOME` | non | AdSense ; prioritaire sur Adsterra si les deux sont posés |
| `NEXT_PUBLIC_ADSTERRA_SCRIPT` / `..._CONTAINER` | non | Adsterra Native Banner (utilisé si AdSense absent) |

**Ne jamais** laisser `ADMIN_PASSWORD`/`ADMIN_SECRET` aux valeurs par défaut en
production. Le cookie admin est `httpOnly`, `sameSite=lax`, `secure` en prod.

> ⚠️ Les variables `NEXT_PUBLIC_*` sont **inlinées au moment du build** : les
> poser (ou les modifier) impose un redéploiement pour qu'elles soient
> prises en compte.

---

## 4. Nettoyage automatique (14 jours)

- **Automatique** : purge déclenchée par l'activité du site, au plus une fois
  toutes les 24 h (table `app_state`, clé `last_cleanup`). Elle marque les
  contenus expirés (`status = 'expired'`), supprime les images associées, puis
  purge les métadonnées 30 jours après expiration.
- **Manuel** : bouton « Nettoyer » dans `/admin`, ou appel direct :

```bash
curl -X POST https://votre-domaine/api/cleanup \
  -H "Authorization: Bearer $CRON_SECRET"
```

À l’expiration : statut `expired`, image supprimée, lien de révélation invalide.

---

## 5. À faire avant mise en production

1. **Persistance** : ✅ fait — Neon Postgres (images stockées en base64 dans
   `creations.imageb64`). Aucune écriture disque, donc compatible avec les
   hébergeurs au système de fichiers éphémère (Vercel, Render Free…).
2. **Secrets** : définir `ADMIN_PASSWORD`, `ADMIN_SECRET`, `CRON_SECRET`.
3. **Mentions légales / hébergeur** : tout est piloté par `src/lib/legal.ts`.
   L'éditeur est renseigné : **Paul Paulin**, `paulloodner@gmail.com`,
   téléphone/WhatsApp `+229 01 65 24 06 54`, personne physique à titre non
   professionnel (LCEN art. 1-1, rédaction loi SREN du 21 mai 2024). L'hébergeur
   est renseigné : **Render Services, Inc., 525 Brannan Street, Suite 300,
   San Francisco, CA 94107, USA**. Les partenaires (Render, Neon, Adsterra)
   sont publiés dans la politique de confidentialité (`LEGAL.partners`).
   ⚠️ Si le service devient **professionnel** (publicités rémunérées, vente,
   contrepartie économique), ajouter l'immatriculation le cas échéant
   (art. 1-1 I).
4. **Publicité** : consent-gated (`src/lib/consent.ts` + `ConsentBanner`).
   Aucun emplacement n'est rendu avant acceptation ; un refus masque
   définitivement les emplacements. Variables : `NEXT_PUBLIC_ADSTERRA_SCRIPT`
   et `NEXT_PUBLIC_ADSTERRA_CONTAINER` (ou AdSense).
5. **HTTPS + domaine** : `NEXT_PUBLIC_SITE_URL` en https ; les QR connectés
   encodent cette origine.
6. **Sauvegarde** : la base Neon est sauvegardée par le plan (Free = 7 jours
   environ) ; export ponctuel possible via `neon` CLI ou l'API Neon.

### 5 bis. Hébergement gratuit : comparatif vérifié (nov. 2026)

La persistance est désormais **externalisée (Neon Postgres)**, donc le critère
« disque persistant » ne contraint plus le choix de l'hébergeur.

| Hébergeur | Gratuit | Node/Next | Usage commercial / pub sur l'offre gratuite |
|---|---|---|---|
| **Render Free** | oui (0.1 CPU, 512 Mo) | ✅ | ✅ autorisé — **retenu** |
| Oracle Cloud Always Free | oui (VPS ARM) | ✅ | ✅ autorisé (alternative, sans cold-start) |
| Cloudflare Pages/Workers | oui | ⚠️ runtime à adapter | ✅ autorisé, bande passante illimitée |
| Koyeb Free | oui | ✅ | ✅ autorisé |
| Vercel Hobby | oui | ✅ | ❌ **interdit** : usage personnel non commercial ; la pub = commercial |
| Netlify Free | oui (300 crédits/mois) | ✅ | ✅ autorisé |

**Render Free — limites à connaître** (doc officielle, nov. 2026) :
- arrêt après **15 min** sans trafic, redémarrage en ~1 min (page de chargement
  servie par Render pendant la reprise) ;
- **750 instance-hours / mois / workspace** (un serviceawake en continu ≈ 744 h) ;
- système de fichiers éphémère ⇒ **impossible de perdre la base** (Neon) ;
- `/robots.txt` renvoie automatiquement `disallow all` quand le service dort ;
- Render peut suspendre un service gratuit qui émet un volume sortant
  anormal (notre accès à Neon entre dans ce cadre, à volume faible) ;
- la doc officielle précise : *ne pas utiliser les instances gratuites en
  production* — acceptable pour un service naissant à faible trafic.

Rappel légal : quel que soit l'hébergeur choisi, son **nom + adresse** doivent
figurer dans les mentions légales (LCEN art. 1-1). Les identités légales
d'hébergeurs vérifiés sont prêtes dans `LEGAL.hostCandidates`.

### 5 ter. Nom de domaine propre et court (sans marque d'hébergeur)

Objectif : une adresse type `oopsqr.<tld court>`, **pas** `oopsqr.vercel.app` /
`…netlify.app` / `…github.io`. Tous les hébergeurs gratuits sérieux acceptent un
**domaine personnalisé** (Vercel Hobby : 50/projet ; Cloudflare Pages : 100 ;
Netlify Free : oui avec SSL). Le domaine lui-même se loue chez un registrar.

Vérifié nov. 2026 : **il n'existe plus de TLD réel gratuit fiable** (Freenom
`.tk/.ml/.ga` est mort). Options réelles :

| Option | Exemple | Coût | Délai / limites |
|---|---|---|---|
| **TLD court pas cher (recommandé)** | `oopsqr.xyz`, `oopsqr.fr`, `oopsqr.io` | ~1 € la 1ʳᵉ année (.xyz/.online), puis ~10–12 €/an ; .fr ~10 €/an ; .io ~30–50 €/an | immédiat, à vous, propre |
| eu.org | `oopsqr.eu.org` | gratuit à vie | revue manuelle **2–6 semaines+**, usage commercial découragé |
| pp.ua | `oopsqr.pp.ua` | gratuit | activation téléphone/Telegram, WHOIS public |
| js.org | `oopsqr.js.org` | gratuit | projets JS uniquement, hébergement GitHub Pages requis |
| is-a.dev | `oopsqr.is-a.dev` | gratuit | perso/dev, **non commercial** |

Recommandation pour OOPSQR (site public + pub discrète + Node/SQLite) :
**acheter un TLD court pas cher** (`oopsqr.xyz` ou `oopsqr.fr`) et le pointer vers
l'hébergeur retenu (VPS Oracle Always Free pour Node+SQLite, ou Cloudflare/Netlify
après externalisation de la base). Les suffixes gratuits communautaires
(eu.org, is-a.dev, js.org) déconseillent ou interdisent l'usage commercial :
à réserver aux demos, pas au service financé par la pub.

Une fois le domaine obtenu : renseignez `NEXT_PUBLIC_SITE_URL=https://<domaine>`
(les QR connectés encodent cette origine) et ajoutez le domaine dans le tableau
de bord de l'hébergeur (DNS + HTTPS automatique).

### 5 quater. Déploiement Render + publicité (Adsterra native)

**Publicité retenue : Adsterra, format Native Banner** (discret, pas de
popunder/push). Composant `src/components/AdsterraSlot.tsx`, chargé uniquement
après consentement (`oopsqr-consent=accepted`). `AdSlot` choisit : AdSense si
configuré, sinon Adsterra, sinon **rien** (aucun placeholder avant accord).

Variables : `NEXT_PUBLIC_ADSTERRA_SCRIPT` (src complet du `invoke.js`) et
`NEXT_PUBLIC_ADSTERRA_CONTAINER` (id du div). Obtenues dans le dashboard
Adsterra → Websites → add website → format **Native Banner** (le site doit être
en ligne et vérifié).

**Déploiement Render (Web Service, plan Free)** :

| Champ | Valeur |
|---|---|
| Runtime | Node (`NODE_VERSION=22.x` ou `engines` du `package.json`) |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Plan | Free |
| Region | Frankfurt (UE) |
| Root Directory | *(vide)* |

Variables d'environnement à poser :
`DATABASE_URL` (Neon, chaine **pooled** : `postgresql://…-pooler…/neondb?sslmode=require`),
`ADMIN_PASSWORD`, `ADMIN_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`,
puis `NEXT_PUBLIC_ADSTERRA_SCRIPT` / `NEXT_PUBLIC_ADSTERRA_CONTAINER`.

**Alternatives** : Vercel Pro (20 $/mois) si l'on veut rester sur Vercel ;
Oracle Cloud Always Free / Koyeb Free en hébergeurs Node gratuits.
**Vercel Hobby interdit l'usage commercial et la publicité.**

---

## 6. Structure

```
src/
  app/
    (site)/            pages publiques + layout (header, footer, nav mobile)
    admin/             back-office
    api/               content, media, report, cleanup, admin/*
    s/[id]/            révélation
  components/
    creator/           Creator, ImageCropper, IconPicker
    site/              SiteHeader, SiteFooter, MobileNav
    admin/             LoginForm, AdminSurprises, AdminReports, AdminCleanup…
    MiniCreator.tsx    simulateur d’accueil
    LibraryExplorer.tsx bibliothèque interactive
  lib/
    qr-render.ts       moteur QR (SVG + canvas), contraste, zone de silence
    qr-icons.ts        tracés des icônes de texte
    download.ts        exports PNG/SVG/PDF + presets d’impression
    image.ts / logo.ts compression & logo côté client
    db.ts              SQLite, expirations, stats, rate limits
    admin-auth.ts      session admin HMAC
scripts/               next.cjs (webpack + patch FS), patch-fs.cjs
```

---

## 7. Validation effectuée

- `npm run typecheck` et `npm run build` : verts.
- Parcours testés en navigateur : accueil + simulateur (PNG téléchargé),
  passage à l’éditeur avec brouillon, icônes haut/bas, exports SVG + PDF (A4 et
  planche), bibliothèque (modale, Échap, filtres + URL), révélation, admin.
- Responsive : nav mobile basse sous 768 px, aperçu avant les réglages sous
  1024 px, cibles tactiles ≥ 44 px, champs 16 px. Les utilitaires Tailwind
  passent en `@layer utilities` au‑dessus des composants (`@layer components`).
