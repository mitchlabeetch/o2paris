# Guide d'exploration du projet O2 Paris pour Aymeric

Bienvenue Aymeric ! Ce document a pour but de t'aider à découvrir la structure d'une application web moderne construite avec **Next.js**, **React**, **TypeScript** et **Tailwind CSS**.

Tu trouveras ci-dessous la liste de tous les fichiers présents dans le code source du projet. Cette vue d'ensemble te permettra de comprendre comment les différentes briques s'assemblent.

## Structure et Inventaire des Fichiers

### 1. Configuration et Racine du Projet
Ces fichiers servent à configurer l'environnement de développement, les outils de build et le déploiement.

*   `package.json` : Le cœur du projet Node.js. Il liste les dépendances (librairies) et les scripts de commande (démarrage, build).
*   `package-lock.json` : Verrouille les versions exactes des dépendances pour garantir que tout le monde utilise les mêmes.
*   `next.config.js` : Configuration spécifique au framework Next.js.
*   `tsconfig.json` : Configuration du compilateur TypeScript (règles de typage).
*   `tailwind.config.ts` : Configuration du framework CSS Tailwind (couleurs, polices, extensions).
*   `postcss.config.js` : Configuration pour le traitement du CSS.
*   `.env.example` : Modèle des variables d'environnement (secrets, clés API) nécessaires.
*   `.eslintrc.json` : Configuration du linter (outil qui vérifie la qualité du code).
*   `.gitignore` : Liste les fichiers à ne pas envoyer sur Git (comme les mots de passe ou les dossiers de build).
*   `vercel.json` : Configuration pour le déploiement sur la plateforme Vercel.

### 2. Documentation et Scripts Utilitaires
Fichiers d'aide et scripts pour la gestion de la base de données ou le débogage.

*   `README.md` : La documentation principale du projet.
*   `ARCHITECTURE.md` : Détails sur l'architecture technique.
*   `CONTRIBUTING.md` : Guide pour contribuer au projet.
*   `DEPLOYMENT.md` : Instructions de déploiement.
*   `DOCUMENTATION.md` : Documentation supplémentaire.
*   `QUICKSTART.md` : Guide de démarrage rapide.
*   `TROUBLESHOOTING.md` : Guide de résolution des problèmes.
*   `VERCEL_SETUP.md` : Guide spécifique pour Vercel.
*   `init_db.js` / `init_db_js.js` : Scripts d'initialisation de la base de données.
*   `check_db_duplicates.js` : Script pour vérifier les doublons en base.
*   `verify_db_standalone.js` / `verify_tiles_db.js` : Scripts de vérification de l'intégrité des données.

### 3. Application (Dossier `app/`)
C'est le cœur de l'application Next.js (App Router). Chaque dossier correspond souvent à une route URL.

*   `app/layout.tsx` : Le squelette global de l'application (contient `<html>`, `<body>`). Il enveloppe toutes les pages.
*   `app/page.tsx` : La page d'accueil (`/`). C'est le point d'entrée principal visible par l'utilisateur.
*   `app/not-found.tsx` : La page affichée lors d'une erreur 404.
*   `app/globals.css` : Les styles CSS globaux.
*   `app/icon.svg` : L'icône du site (favicon).
*   `app/admin/page.tsx` : La page d'administration (`/admin`).

#### Routes API (`app/api/`)
Ce sont les "fonctions backend" qui gèrent les données (GET, POST, etc.).

*   `app/api/tiles/route.ts` : Gestion des tuiles (récupération, création).
*   `app/api/tiles/[id]/route.ts` : Opérations sur une tuile spécifique (modification, suppression).
*   `app/api/tiles/reorder/route.ts` : Réorganiser les tuiles.
*   `app/api/config/route.ts` : Configuration globale de l'app.
*   `app/api/auth/route.ts` : Vérification de l'authentification.
*   `app/api/auth/login/route.ts` : Gestion de la connexion.
*   `app/api/backgrounds/route.ts` : Gestion des images de fond.
*   `app/api/images/route.ts` : Gestion des uploads d'images.
*   `app/api/sounds/route.ts` : Gestion des fichiers sons.
*   `app/api/fix-sounds/route.ts` : Utilitaire pour corriger les chemins de sons.
*   `app/api/icons/route.ts` : Gestion des icônes.
*   `app/api/init/route.ts` : Initialisation via API.
*   `app/api/pinpoints/route.ts` : (Semble inutilisé ou pour une fonctionnalité future de carte).

### 4. Composants (Dossier `components/`)
Les briques visuelles réutilisables de l'interface (React).

*   `components/TileGrid.tsx` : La grille principale affichant les tuiles (Masonry layout).
*   `components/Tile.tsx` : Le composant individuel d'une tuile (image + son).
*   `components/TileModal.tsx` : La fenêtre modale qui s'ouvre au clic sur une tuile.
*   `components/Loading.tsx` : Indicateur de chargement.
*   `components/Modal.tsx` : Composant de fenêtre modale générique.
*   `components/Toast.tsx` : Petites notifications éphémères.
*   `components/WaterCurtain.tsx` : Effet visuel (peut-être inutilisé).
*   `components/Map.tsx` : Ancien composant de carte (Note : Il n'est plus utilisé dans la version actuelle, comme tu le remarqueras).

#### Composants d'Administration (`components/admin/`)
Composants spécifiques à l'interface d'admin.

*   `components/admin/LoginForm.tsx` : Formulaire de connexion.
*   `components/admin/ConfigForm.tsx` : Formulaire de configuration du site.
*   `components/admin/TileForm.tsx` : Formulaire pour créer/éditer une tuile.
*   `components/admin/AdminTileGrid.tsx` : Grille de tuiles version admin (avec boutons d'édition).
*   `components/admin/SoundList.tsx` : Liste pour gérer les sons.
*   `components/admin/PinpointList.tsx` : Liste pour gérer les points (lié à l'ancienne carte).

### 5. Librairies et Utilitaires (Dossier `lib/`)
Code partagé, logique métier et connexions aux services.

*   `lib/db.ts` : Gestion de la connexion à la base de données (SQLite/PostgreSQL).
*   `lib/auth.ts` : Logique d'authentification et sécurité.
*   `lib/client-utils.ts` : Fonctions utilitaires pour le frontend (ex: mélange aléatoire).
*   `lib/fallbackAudio.ts` : Gestion des sons par défaut si un fichier manque.

---
*Ce document servira de base pour ton exploration du code. N'hésite pas à ouvrir ces fichiers pour voir comment ils sont construits !*
