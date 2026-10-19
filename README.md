# Brace — pizzeria napoletana (concept, Grenoble)

Site cadeau pour un client qui ouvre une pizzeria. Nom, adresse, numéros et photos sont **fictifs** :
tout se remplace dans `config/site.config.js`. Audit des vidéos de référence : [retaurant/AUDIT.md](../../retaurant/AUDIT.md).

## Lancer

```bash
python -m http.server 5175 -d clients/pizzeria-brace
```

## Deux versions

| Page | Hero | Fichiers propres |
|---|---|---|
| `index-v1.html` (v1, **local seulement**, ignorée par git) | 8 étapes, ~18 écrans de scroll, 718 images (16 Mo) | `config/site.config.js`, `assets/js/hero.js`, `assets/frames/` |
| `index.html` (v2, **publiée**) | 7 étapes (sans « Dorée. »), rythme par étape, ~8 écrans, 472 images (9 Mo desktop, 7 Mo mobile), lien « Passer », bande translucide derrière le header | `config/site.config.v2.js`, `assets/js/hero-v2.js`, `assets/css/style-v2.css`, `assets/frames-v2/`, `assets/frames-v2-m/` |

`app.js` et `style.css` sont communs. Copie figée du code v1 : `_backup-v1/`.
Déploiement : repo GitHub → Vercel (site statique, sans build). `.gitignore` exclut la v1 et les notes ; `.vercelignore` exclut README et `tools/`.
Rythme v2 : champ `scroll` de chaque étape dans `site.config.v2.js` (en écrans).
Frames v2 : `OUT=assets/frames-v2 bash tools/build-frames.sh "../../retaurant/clips/drafts-v2" 18 854 0.35 50` (et `frames-v2-m` en 720 / 45).

## Structure

| Fichier | Rôle |
|---|---|
| `config/site.config.js` | Tout le contenu : marque, contact, étapes du hero, carte, chiffres, créneaux, FAQ |
| `assets/js/hero.js` | Hero piloté au scroll : `assets/frames/*.webp` dessinées sur un canvas collant. Descendre = la pizza se fait, remonter = elle se défait |
| `assets/js/app.js` | Carte (fiche « verre »), compteurs, commande → WhatsApp, assistant, infos |
| `assets/css/style.css` | Styles ; couleurs dans `:root` |
| `assets/img/` | Photos de la carte (`*.webp`) + `og.jpg` (aperçu de lien) |
| `tools/build-frames.sh` | Transforme les clips en images du hero |

## Remplacer la vidéo du hero (ex. passage en 1080p)

Les clips actuels sont les **brouillons 480p** Seedance (`retaurant/clips/drafts/`, nommés `1_…mp4` à `8_…mp4`).
Après finalisation en 1080p, déposer les nouveaux clips dans un dossier, puis :

```bash
bash clients/pizzeria-brace/tools/build-frames.sh "chemin/vers/clips-1080p" 12 1600
```

Recopier `frames` et `clipStarts` affichés dans `config/site.config.js` → `hero`.
Les images-clés sources sont dans `retaurant/keyframes/final/`.
