# OOPSQR

Plateforme web gratuite de création de **QR codes surprises** : une blague, un faux
Wi‑Fi, un message secret ou une image cachés derrière un QR code. Sans compte,
sans application, avec publicités discrètes et contenus connectés conservés
**14 jours**.

- Stack : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
  SQLite (`better-sqlite3`) · `qrcode` · `jsPDF` · `lucide-react`.
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
| `ADMIN_PASSWORD` | **oui** | Mot de passe admin (défaut dev : `oopsqr-admin`) |
| `ADMIN_SECRET` | **oui** | Secret HMAC du cookie admin (chaîne aléatoire longue) |
| `CRON_SECRET` | recommandé | Bearer token de `/api/cleanup` pour le cron |
| `NEXT_PUBLIC_SITE_URL` | recommandé | Origine publique encodée dans les QR connectés |
| `DATA_DIR` | non | Emplacement des données (défaut `./data`) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` / `..._SLOT_HOME` | non | AdSense ; sans elles, emplacements placeholders |

**Ne jamais** laisser `ADMIN_PASSWORD`/`ADMIN_SECRET` aux valeurs par défaut en
production. Le cookie admin est `httpOnly`, `sameSite=lax`, `secure` en prod.

---

## 4. Nettoyage automatique (14 jours)

- Opportuniste : déclenché au plus toutes les 10 min lors d’une création.
- Manuel : bouton « Nettoyer » dans `/admin`.
- **Cron recommandé** (quotidien) :

```bash
curl -X POST https://votre-domaine/api/cleanup \
  -H "Authorization: Bearer $CRON_SECRET"
```

À l’expiration : statut `expired`, fichier image supprimé, lien invalide.
Les métadonnées expirées sont purgées 30 jours après expiration.

---

## 5. À faire avant mise en production

1. **Stockage Cloud** : le MVP stocke images + SQLite en local (`data/`). Le cahier
   des charges impose un stockage objet séparé (offre gratuite au lancement).
   Brancher un fournisseur (S3/R2/Supabase Storage…) derrière
   `db.saveUploadedImage` / `db.readUploadedImage` et migrer la base vers un
   service managé si l’hébergement est serverless.
2. **Secrets** : définir `ADMIN_PASSWORD`, `ADMIN_SECRET`, `CRON_SECRET`.
3. **Mentions légales / hébergeur** : tout est piloté par `src/lib/legal.ts`.
   L'éditeur est renseigné : **COFFI Gildas Loîc Paulin**,
   `coffigildas268@gmail.com`, personne physique à titre non professionnel
   (LCEN art. 1-1, rédaction loi SREN du 21 mai 2024). Il reste à
   **renseigner `LEGAL.host`** (nom + adresse de l'hébergeur) avant toute mise en
   ligne publique ; tant que `host` est `null`, la page affiche un avis honnête.
   Des identités légales d'hébergeurs vérifiés sont prêtes dans
   `LEGAL.hostCandidates` (voir §5 bis).
   ⚠️ Si le service devient **professionnel** (publicités rémunérées, vente,
   contrepartie économique), ajouter domicile + téléphone + immatriculation
   le cas échéant (art. 1-1 I).
4. **Publicité** : renseigner les identifiants AdSense ; le consentement est
   géré par `ConsentBanner` (aucune pub avant la révélation).
5. **HTTPS + domaine** : `NEXT_PUBLIC_SITE_URL` en https ; les QR connectés
   encodent cette origine.
6. **Sauvegarde** : sauvegarder `data/` (ou le stockage Cloud) régulièrement.

### 5 bis. Hébergement gratuit : comparatif vérifié (nov. 2026)

Le MVP utilise **Node + SQLite sur disque persistant**. Tous les hébergeurs
« statiques/serverless » gratuits ne conviennent donc pas tels quels.

| Hébergeur | Gratuit | Node + SQLite persistant | Usage commercial / pub sur l'offre gratuite |
|---|---|---|---|
| **Oracle Cloud Always Free** | oui (VPS ARM) | **oui** (disque persistant) | autorisé |
| Render Free | oui | Node oui, mais disque **éphémère** (SQLite perdu au restart) → externaliser la base | autorisé |
| Cloudflare Pages/Workers | oui | non natif (serverless) → migrer vers D1/Turso | autorisé, bande passante illimitée |
| Netlify Free | oui (300 crédits/mois) | fonctions serverless → externaliser la base | autorisé |
| Vercel Hobby | oui | oui (Next.js) | **interdit** : usage personnel non commercial ; la pub = commercial |
| GitHub Pages | oui | non (statique) | **interdit** pour activité en ligne / pub |

Recommandation pour OOPSQR (Node + SQLite + pub discrète) : **Oracle Cloud
Always Free** (VPS persistant gratuit) ou un petit VPS. Si vous migrez vers du
serverless, externalisez d'abord la base (Turso/D1/Postgres managé).

Rappel légal : quel que soit l'hébergeur choisi, son **nom + adresse** doivent
figurer dans les mentions légales (LCEN art. 1-1). Copiez l'entrée correspondante
de `LEGAL.hostCandidates` dans `LEGAL.host`.

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

### 5 quater. Déploiement + publicité (Adsterra native)

**Publicité retenue : Adsterra, format Native Banner** (discret, pas de
popunder/push). Composant `src/components/AdsterraSlot.tsx`, chargé uniquement
après consentement (`oopsqr-consent=accepted`). `AdSlot` choisit : AdSense si
configuré, sinon Adsterra si configuré, sinon placeholder.

Variables : `NEXT_PUBLIC_ADSTERRA_SCRIPT` (src complet du `invoke.js`) et
`NEXT_PUBLIC_ADSTERRA_CONTAINER` (id du div). Obtenues dans le dashboard
Adsterra → Websites → add website → format **Native Banner** (le site doit être
en ligne et vérifié).

**⚠️ Vercel Hobby interdit l'usage commercial / la publicité.** Pour monétiser :
- **Vercel Pro** (20 $/mois) — reste sur Vercel ; ou
- **hébergeur Node gratuit autorisant la pub** : Oracle Cloud Always Free (VPS,
  sans cold-start), Render free (cold-starts), Koyeb free. Depuis la migration
  Neon, l'app n'a plus besoin de disque local → tout hébergeur Node convient.

**Authentifier le CLI Vercel** (le navigateur connecté ne suffit pas) :
- soit `vercel login` puis valider dans le navigateur ;
- soit créer un token : Vercel → Account Settings → Tokens → Create Token
  (scope *Full Account*), puis `vercel deploy --prod --token=<TOKEN>`.
Le token n'est affiché qu'une fois : le copier immédiatement.

Environnements à poser sur l'hébergeur : `DATABASE_URL` (Neon),
`ADMIN_PASSWORD`, `ADMIN_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`,
et les variables pub (`NEXT_PUBLIC_ADSTERRA_*`).

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
