# Guide de Déploiement - O2Paris

Ce guide vous aidera à déployer l'application O2Paris sur Vercel avec une base de données Neon PostgreSQL.

## Prérequis

- Un compte GitHub (pour héberger le code)
- Un compte Vercel (gratuit) - https://vercel.com
- Un compte Neon (gratuit) - https://neon.tech

## Étape 1 : Configuration de la Base de Données Neon

1. Créez un compte sur https://neon.tech
2. Créez un nouveau projet
3. Notez la chaîne de connexion (elle ressemble à : `postgresql://user:password@host.region.neon.tech/dbname`)
4. La base de données sera automatiquement créée

**Note**: Si vous avez déjà une base de données Neon, utilisez votre chaîne de connexion existante.

## Étape 2 : Génération du Mot de Passe Admin

Sur votre machine locale, générez un hash pour votre mot de passe admin :

```bash
node scripts/generate-password.js votre_mot_de_passe_securise
```

Notez le hash généré, vous en aurez besoin pour Vercel.

## Étape 3 : Déploiement sur Vercel

1. Connectez-vous à https://vercel.com
2. Cliquez sur "Add New Project"
3. Importez votre dépôt GitHub `lightmyfireadmin/o2paris`
4. Configurez les variables d'environnement :
   - **Variable name**: `DATABASE_URL`  
     **Value**: Votre chaîne de connexion Neon PostgreSQL
   - **Variable name**: `ADMIN_PASSWORD_HASH`  
     **Value**: Le hash bcrypt généré à l'étape 2
   
   ⚠️ **Important**: Les noms des variables doivent être exactement `DATABASE_URL` et `ADMIN_PASSWORD_HASH` (sensibles à la casse).

5. Cliquez sur "Deploy"

## Étape 5 : Initialisation de la Base de Données

Une fois déployé :

1. Accédez à votre application : `https://votre-app.vercel.app`
2. Visitez : `https://votre-app.vercel.app/api/init`
3. Vous devriez voir : `{"message":"Database initialized successfully","success":true}`

Si vous rencontrez une erreur, vérifiez que `DATABASE_URL` est correctement configuré.

## Étape 6 : Premier Accès à l'Administration

1. Visitez : `https://votre-app.vercel.app/admin`
2. Connectez-vous avec le mot de passe que vous avez utilisé pour générer le hash à l'étape 2
3. Commencez à ajouter des points sonores !

## Configuration du Domaine Personnalisé (Optionnel)

Dans les paramètres Vercel de votre projet :
1. Allez dans "Settings" > "Domains"
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions pour configurer les DNS

## Ajouter des Points Sonores

### 1. Télécharger un Son

1. Allez dans l'onglet "Sons" de l'administration
2. Sélectionnez un fichier audio (MP3, WAV, OGG)
3. Notez l'ID retourné (ex: 1)

### 2. Créer un Point

1. Allez dans l'onglet "Points sur la carte"
2. Cliquez sur "+ Nouveau point"
3. Remplissez :
   - Latitude : ex: 48.8566 (Tour Eiffel)
   - Longitude : ex: 2.2944
   - Titre : ex: "Tour Eiffel"
   - Description : ex: "Le son de l'eau près de la Tour Eiffel"
   - URL du son : `/api/sounds?id=1` (utilisez l'ID de l'étape 1)
4. Cliquez sur "Sauvegarder"

### 3. Coordonnées Utiles pour Paris

Quelques coordonnées de lieux emblématiques de Paris :

- Tour Eiffel : 48.8584, 2.2945
- Notre-Dame : 48.8530, 2.3499
- Sacré-Cœur : 48.8867, 2.3431
- Arc de Triomphe : 48.8738, 2.2950
- Jardin du Luxembourg : 48.8462, 2.3371
- Trocadéro : 48.8620, 2.2876
- Parc Monceau : 48.8799, 2.3089
- Pont des Arts : 48.8583, 2.3375

## Configuration de la Carte

Dans l'onglet "Configuration" :

### URLs de Tuiles Alternatives

- **OpenStreetMap (défaut)** : `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **CartoDB Light** : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`
- **CartoDB Dark** : `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`
- **Stamen Watercolor** : `https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg`

### Paramètres de Zoom

- **Zoom initial** : 13 (vue de quartier)
- **Zoom min** : 10 (vue large de Paris)
- **Zoom max** : 18 (vue très détaillée)

## Dépannage

### La carte ne s'affiche pas

- Vérifiez que l'URL des tuiles est correcte
- Vérifiez votre connexion internet

### Les sons ne se jouent pas

- Vérifiez que l'URL du son est correcte (`/api/sounds?id=X`)
- Vérifiez que le fichier audio a bien été téléchargé
- Vérifiez les formats supportés par votre navigateur

### Erreur de connexion à la base de données

- Vérifiez que `DATABASE_URL` est correctement configuré dans Vercel
- Vérifiez que votre base de données Neon est active
- Visitez `/api/init` pour réinitialiser les tables

### Impossible de se connecter à l'admin

- Vérifiez que `ADMIN_PASSWORD_HASH` est correctement configuré
- Régénérez un nouveau hash avec `scripts/generate-password.js`
- Vérifiez que vous utilisez le bon mot de passe

## Mises à Jour

Pour mettre à jour l'application :

1. Pushez vos modifications sur GitHub
2. Vercel déploiera automatiquement les changements
3. Vérifiez le déploiement dans le dashboard Vercel

## Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

## Sécurité

- Ne partagez jamais votre `DATABASE_URL`
- Ne partagez jamais votre `ADMIN_PASSWORD_HASH`
- Utilisez des mots de passe forts (minimum 12 caractères)
- Changez régulièrement votre mot de passe admin
- En production, assurez-vous que `ADMIN_PASSWORD_HASH` est toujours défini
