# Guide de Contribution - O2Paris

Merci de votre intérêt pour contribuer à O2Paris ! Ce guide vous aidera à démarrer.

## Configuration de l'Environnement de Développement

### Prérequis

- Node.js 18+ et npm
- Un compte Neon PostgreSQL pour la base de données de développement
- Git

### Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/lightmyfireadmin/o2paris.git
cd o2paris
```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` :
```bash
cp .env.example .env
```

4. Configurez vos variables d'environnement dans `.env` :
```env
DATABASE_URL=your_neon_postgresql_connection_string
ADMIN_PASSWORD=your_admin_password
NEXTAUTH_SECRET=your_secret
```

Pour le développement, vous pouvez laisser `ADMIN_PASSWORD` vide, le mot de passe par défaut sera `Admin123`.

5. Initialisez la base de données :
Démarrez le serveur de développement et visitez `http://localhost:3000/api/init`

6. Lancez le serveur de développement :
```bash
npm run dev
```

## Structure du Projet

```
o2paris/
├── app/                  # Next.js App Router
│   ├── api/             # Routes API
│   │   ├── auth/        # Authentification
│   │   ├── config/      # Configuration de la carte
│   │   ├── init/        # Initialisation DB
│   │   ├── pinpoints/   # Gestion des points
│   │   └── sounds/      # Gestion des sons
│   ├── admin/           # Interface d'administration
│   ├── globals.css      # Styles globaux
│   ├── layout.tsx       # Layout principal
│   └── page.tsx         # Page d'accueil (carte)
├── components/          # Composants React réutilisables
│   └── Map.tsx          # Composant de carte Leaflet
├── lib/                 # Bibliothèques et utilitaires
│   ├── auth.ts          # Logique d'authentification
│   └── db.ts            # Configuration DB et schémas
├── scripts/             # Scripts utilitaires
└── public/              # Assets statiques
```

## Workflow de Développement

### 1. Créer une Branche

```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 2. Faire vos Modifications

- Suivez les conventions de code existantes
- Utilisez TypeScript pour tous les nouveaux fichiers
- Ajoutez des commentaires pour le code complexe

### 3. Tester Localement

```bash
# Vérifier le linting
npm run lint

# Construire le projet
npm run build

# Tester en local
npm run dev
```

### 4. Commiter vos Changements

```bash
git add .
git commit -m "feat: description claire de votre fonctionnalité"
```

Convention de commit :
- `feat:` pour une nouvelle fonctionnalité
- `fix:` pour une correction de bug
- `docs:` pour la documentation
- `style:` pour le formatage
- `refactor:` pour la refactorisation
- `test:` pour les tests
- `chore:` pour les tâches de maintenance

### 5. Pousser et Créer une Pull Request

```bash
git push origin feature/ma-nouvelle-fonctionnalite
```

Puis créez une Pull Request sur GitHub.

## Directives de Code

### TypeScript

- Utilisez des types explicites autant que possible
- Évitez `any` - préférez `unknown` si nécessaire
- Définissez des interfaces pour les objets complexes

### React

- Utilisez des composants fonctionnels avec hooks
- Préférez `const` pour déclarer les composants
- Utilisez `'use client'` uniquement quand nécessaire

### CSS

- Utilisez Tailwind CSS pour le styling
- Suivez le thème "eau" existant (couleurs bleues)
- Assurez-vous que le design est responsive

### API Routes

- Validez toujours les entrées utilisateur
- Gérez les erreurs proprement
- Retournez des messages d'erreur clairs
- Utilisez les codes HTTP appropriés

### Sécurité

- Ne committez JAMAIS de secrets ou credentials
- Utilisez des mots de passe forts en production
- Validation et sanitization des entrées
- Protection CSRF pour les routes sensibles

## Tests

Actuellement, le projet n'a pas de tests automatisés. Les contributions pour ajouter des tests sont les bienvenues !

Pour tester manuellement :

1. **Interface Principale**
   - La carte s'affiche correctement
   - Les marqueurs apparaissent aux bonnes positions
   - Les popups s'ouvrent au clic
   - L'audio se joue/met en pause correctement

2. **Interface Admin**
   - L'authentification fonctionne
   - CRUD des points fonctionne
   - Upload de sons fonctionne
   - Configuration de la carte se sauvegarde

3. **API**
   - Toutes les routes retournent les bonnes réponses
   - La validation des erreurs fonctionne
   - L'authentification est requise où nécessaire

## Fonctionnalités Souhaitées

Idées de contributions bienvenues :

- [ ] Tests automatisés (Jest, React Testing Library)
- [ ] Internationalisation (i18n)
- [ ] Upload de plusieurs fichiers audio simultanément
- [ ] Prévisualisation audio dans l'admin
- [ ] Recherche et filtrage de points
- [ ] Export/import de données
- [ ] Statistiques d'utilisation
- [ ] Mode sombre
- [ ] Accessibilité améliorée (ARIA, navigation clavier)
- [ ] PWA (Progressive Web App)
- [ ] Clustering de marqueurs pour les zones denses
- [ ] Tracés de parcours entre points
- [ ] Galerie de photos pour chaque point

## Rapporter des Bugs

Créez une issue sur GitHub avec :

1. Description claire du problème
2. Étapes pour reproduire
3. Comportement attendu vs observé
4. Captures d'écran si pertinent
5. Informations système (navigateur, OS)

## Demander des Fonctionnalités

Créez une issue "Feature Request" avec :

1. Description claire de la fonctionnalité
2. Cas d'usage
3. Avantages pour les utilisateurs
4. Mockups/wireframes si possible

## Questions ?

- Ouvrez une issue pour les questions techniques
- Consultez le README.md et DEPLOYMENT.md pour la documentation

## Code de Conduite

- Soyez respectueux et constructif
- Accueillez les nouveaux contributeurs
- Concentrez-vous sur le code, pas sur la personne
- Aidez à maintenir un environnement positif

## Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence que le projet.

Merci pour votre contribution ! 🎉
