# O2Paris - Carte Sonore Interactive

Carte sonore interactive pour un projet en collaboration avec Eau de Paris

> **🔊 Sounds Not Playing?** If sounds fall back to beep when clicked, see [FIXING_SOUNDS.md](./FIXING_SOUNDS.md) for the complete solution.

## Description

O2Paris est une application de carte interactive qui affiche la ville de Paris avec des points sonores. Chaque point peut être cliqué pour afficher un tooltip avec un texte et des contrôles audio (lecture/pause) qui déclenchent des sons hébergés sur Neon PostgreSQL. L'application suit un thème aquatique en lien avec l'institution publique Eau de Paris.

## Fonctionnalités

- **Carte Interactive** : Visualisation de Paris basée sur Leaflet.js
- **Points Sonores** : Marqueurs cliquables avec descriptions et lecteurs audio
- **Interface d'Administration** : GUI protégée par mot de passe pour :
  - Créer, modifier et supprimer des points sur la carte
  - Télécharger et gérer des fichiers audio
  - Configurer les tuiles de carte, le centre, le zoom
  - Personnaliser les icônes et le design
- **Thème Eau** : Design inspiré de l'eau avec une palette de couleurs bleues
- **Base de Données** : PostgreSQL (Neon) pour stocker les points, sons et configuration

## Technologies Utilisées

- **Next.js 14** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Leaflet.js** : Bibliothèque de cartes interactives
- **React-Leaflet** : Composants React pour Leaflet
- **Neon PostgreSQL** : Base de données serverless
- **Tailwind CSS** : Framework CSS utility-first
- **Vercel** : Plateforme de déploiement

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/lightmyfireadmin/o2paris.git
cd o2paris
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env` basé sur `.env.example` :
```bash
cp .env.example .env
```

Éditez `.env` avec vos informations :
- `DATABASE_URL` : Votre chaîne de connexion Neon PostgreSQL
- `ADMIN_PASSWORD` : Votre mot de passe admin en texte clair (par défaut: Admin123 en développement)
- `NEXTAUTH_SECRET` : Secret généré avec `openssl rand -base64 32`

4. Initialisez la base de données :
   - Option CLI : `psql "$DATABASE_URL" -f scripts/migrations/001_init.sql`
   - Option HTTP : accédez à `/api/init` après le premier démarrage pour créer les tables **et** insérer des données de démonstration

5. Lancez le serveur de développement :
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Déploiement sur Vercel

1. Connectez votre dépôt GitHub à Vercel
2. Configurez les variables d'environnement dans les paramètres Vercel :
   - `DATABASE_URL` : Chaîne de connexion Neon PostgreSQL (requis)
   - `ADMIN_PASSWORD` : Votre mot de passe admin (requis pour production)
   
   **Note importante pour Vercel** : Le nom de la variable d'environnement pour le mot de passe admin doit être exactement `ADMIN_PASSWORD`. Utilisez un mot de passe fort et sécurisez-le via les variables d'environnement cryptées de Vercel.
3. Déployez !

Vercel détectera automatiquement Next.js et utilisera la configuration appropriée.

**⚠️ Important**: Si les sons ne se jouent pas après le déploiement (tombent en son de bip), consultez le guide [VERCEL_SETUP.md](./VERCEL_SETUP.md) pour configurer correctement la variable DATABASE_URL.

## Utilisation

### Interface Principale
- Visualisez la carte de Paris avec les points sonores
- Cliquez sur un point pour voir sa description et écouter le son associé
- Utilisez les contrôles de lecture/pause pour contrôler l'audio

### Interface d'Administration
1. Accédez à `/admin`
2. Connectez-vous avec le mot de passe admin (par défaut en développement: `Admin123`)
3. Gérez les points, sons et configuration de la carte

#### Gérer les Points
- Créez de nouveaux points en spécifiant latitude, longitude, titre, description et URL du son
- Modifiez ou supprimez les points existants

#### Gérer les Sons
- Téléchargez des fichiers audio (MP3, WAV, OGG, etc.)
- Utilisez l'ID retourné dans l'URL du son pour un point : `/api/sounds?id=ID`

#### Configuration de la Carte
- Personnalisez l'URL des tuiles de carte
- Ajustez le centre de la carte (latitude/longitude)
- Configurez les niveaux de zoom (initial, min, max)
- Modifiez l'attribution de la carte

## Structure du Projet

```
o2paris/
├── app/                      # App Router de Next.js
│   ├── api/                  # Routes API
│   │   ├── auth/            # Authentification
│   │   ├── config/          # Configuration de la carte
│   │   ├── init/            # Initialisation de la DB
│   │   ├── pinpoints/       # CRUD des points
│   │   └── sounds/          # Upload/récupération des sons
│   ├── admin/               # Page d'administration
│   ├── globals.css          # Styles globaux
│   ├── layout.tsx           # Layout racine
│   └── page.tsx             # Page principale (carte)
├── components/              # Composants React
│   └── Map.tsx             # Composant carte Leaflet
├── lib/                     # Utilitaires et bibliothèques
│   ├── auth.ts             # Authentification
│   └── db.ts               # Configuration et schémas DB
├── public/                  # Fichiers statiques
├── .env.example            # Exemple de variables d'environnement
├── .gitignore              # Fichiers ignorés par Git
├── next.config.js          # Configuration Next.js
├── package.json            # Dépendances
├── postcss.config.js       # Configuration PostCSS
├── tailwind.config.ts      # Configuration Tailwind CSS
├── tsconfig.json           # Configuration TypeScript
└── vercel.json             # Configuration Vercel
```

## API Endpoints

- `GET /api/pinpoints` : Récupère tous les points
- `POST /api/pinpoints` : Crée un nouveau point
- `PUT /api/pinpoints` : Met à jour un point
- `DELETE /api/pinpoints?id=ID` : Supprime un point

- `GET /api/sounds?id=ID` : Récupère un fichier audio
- `POST /api/sounds` : Télécharge un nouveau son
- `DELETE /api/sounds?id=ID` : Supprime un son

- `GET /api/config` : Récupère la configuration de la carte
- `PUT /api/config` : Met à jour la configuration

- `POST /api/auth` : Authentification admin
- `DELETE /api/auth` : Déconnexion

- `GET /api/init` : Initialise la base de données

## Sécurité

- L'interface d'administration est protégée par authentification
- Utilisez un mot de passe fort pour `ADMIN_PASSWORD` en production
- Les variables d'environnement sensibles ne sont pas committées
- Les sessions utilisent des cookies HTTP-only
- Les mots de passe sont sécurisés via les variables d'environnement cryptées de Vercel

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

Ce projet est développé pour Eau de Paris.

## Documentation Complète

| Document | Description |
|----------|-------------|
| **[QUICK_FIX.md](./QUICK_FIX.md)** | ⚡ Solution rapide (5 min) pour problèmes de son |
| **[FIXING_SOUNDS.md](./FIXING_SOUNDS.md)** | 🔊 Guide complet pour réparer la lecture audio |
| **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** | ⚙️ Configuration Vercel et variables d'environnement |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | 🔧 Dépannage et solutions aux problèmes courants |
| **[DATABASE_CONFIG_NOTES.md](./DATABASE_CONFIG_NOTES.md)** | 🗄️ Notes sur la configuration de la base de données |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | 🚀 Guide de déploiement complet |
| **[QUICKSTART.md](./QUICKSTART.md)** | ⏱️ Démarrage rapide (5 minutes) |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 🏗️ Architecture technique détaillée |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | 🤝 Guide pour contributeurs |
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** | 📋 Résumé du projet |

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.
