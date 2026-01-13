# Guide du Grimoire Numérique pour Raymerique

**Par Meetch, la Cavalière Dorée, la Tourte des Cieux, le Cygne du Vent.**

CC Raymerique

Si tu lis ces lignes, c'est que tu as bravé les tempêtes pour t'aventurer dans les entrailles de **O2 Paris**. Ça tombe mal, j'ai un peu envie d'écrire des bêtises. Oui, c'est un nom nul aussi mais en fait tant pis

Ici, nous ne codons pas avec des pierres et des bâtons, mais avec des outils forgés par les dieu et de la Tech. Laisse-moi t'expliquer comment tout cela tient debout.

---

## 1. Les Langages : L'Alphabet des Dieux

Avant de comprendre *où* sont les choses, il faut comprendre *en quoi* elles sont écrites.

### Petite leçon d'Histoire (Pour les Moldus)

Pour faire un site internet, les anciens utilisaient trois parchemins séparés. C'est la base de tout le web, et c'est important de le savoir pour comprendre pourquoi nous, nous faisons différemment.

*   **HTML (Le Squelette) :** C'est la structure. "Ici, je veux un titre", "Là, une image", "Là, un paragraphe". Sans lui, la page est vide. Mais le HTML est bête : il est statique, il ne bouge pas.
*   **CSS (Le Costume) :** C'est la beauté. "Ce titre doit être rouge", "Cette image doit être ronde". Sans lui, le web serait triste et moche (comme en 1995).
*   **JavaScript (Le Cerveau) :** C'est l'action. "Si je clique ici, ouvre une fenêtre", "Si je descends la page, charge d'autres images". Sans lui, la page est inerte comme une statue.

**Pourquoi on ne fait plus juste ça ?**
Parce que quand le site devient énorme (comme le nôtre), gérer ces trois fichiers séparément devient un cauchemar. Imagine devoir changer le nom d'un bouton dans le HTML, sa couleur dans le CSS, et son action dans le JS... trois fichiers à ouvrir pour une seule modif !

C'est là qu'interviennent nos outils modernes :

### Notre Alphabet à Nous

| Langage / Syntaxe | C'est quoi ? | Rôle dans le projet (Pourquoi ?) |
| :--- | :--- | :--- |
| **TypeScript** (`.ts`) | **JavaScript + Sécurité.** C'est du JavaScript, mais qui t'oblige à être rigoureux. | Si tu essaies d'additionner "Banane" + 5, JavaScript le fait tandis que TypeScript te beugle dessus, ça permet d'éviter les bugs bêtes. |
| **JSX** (`.tsx`) | **HTML + JavaScript mélangés.** C'est du HTML déguisé en JS. | Au lieu de séparer squelette et cerveau, on écrit les deux ensemble. On peut dire : `<h1>Bonjour {nom_utilisateur}</h1>`. C'est ultra-puissant pour créer des pages dynamiques. |
| **Tailwind CSS** | **CSS direct.** Au lieu d'écrire du CSS dans un fichier à part, on met le style directement sur l'élément HTML. | On écrit `<div class="bg-red-500">`. C'est fini de chercher dans 15 fichiers CSS pourquoi ce bouton n'est pas rouge. Tout est sous tes yeux. |
| **SQL** (Postgres) | **Langage de requête.** C'est la langue qu'on parle pour discuter avec la base de données. | On ne dit pas "Donne-moi les données", on dit `SELECT * FROM tiles`. C'est un langage très précis pour extraire exactement ce qu'on veut de notre coffre-fort (Neon). |
| **JSON** (`.json`) | **Texte structuré.** C'est juste du texte rangé proprement avec des accolades `{}`. | C'est le format universel pour stocker de la configuration ou échanger des données. C'est simple, lisible par un humain et par une machine. |

---

## 2. L'Arsenal : Notre Équipement de Guerre

Nous n'allons pas à la bataille les mains vides. Voici les armes légendaires qui composent notre "Stack" technique :

| Outil / Service | C'est quoi ? | Pourquoi c'est cool ? |
| :--- | :--- | :--- |
| **Next.js** | **Le Chef d'Orchestre.** C'est un "Framework" basé sur React. | Si React est le moteur, Next.js est la voiture complète (avec roues, volant, sièges). Il gère tout : l'affichage des pages, le référencement Google, et même le serveur. Sans lui, on devrait tout construire à la main. |
| **React** | **Les Briques LEGO.** Une librairie pour créer des interfaces. | Au lieu de copier-coller du code HTML 50 fois pour faire 50 boutons, on crée un composant "Bouton" en React, et on l'utilise partout. Si on change le composant, tous les boutons du site changent ! |
| **Vercel** | **Le Château dans les Nuages.** Notre hébergeur. | C'est là où le site "habite" sur internet. C'est magique : dès qu'on sauvegarde notre code, Vercel le prend, le construit, et le met en ligne en quelques secondes pour le monde entier. |
| **Neon** | **Le Coffre-fort.** Une base de données moderne (Serverless). | C'est là qu'on stocke toutes les infos des tuiles (titre, image, son). "Serverless" veut dire qu'elle s'allume quand on en a besoin et s'éteint quand on dort (c'est écolo et économique). |

---

## 3. Vue d'Ensemble : La Carte du Monde

Voici le tour du propriétaire, fichier par fichier. J'ai dépoussiéré chaque recoin pour toi.

### Les Fondations (Racine)
*Les règles du jeu, les plans de l'architecte et les clés de la maison.*

#### `package.json`
*   **Chemin :** `./package.json`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/package.json)
*   **C'est quoi ?** Le livre de recettes et l'inventaire.
*   **Détail :** Il contient deux listes vitales :
    1.  `dependencies` : Les ingrédients indispensables (comme React, Next.js). Sans eux, le gâteau ne monte pas. (Jsp c'est miaou-jépété qui a proposé cette métaphore)
    2.  `scripts` : Les formules magiques. Quand tu tapes `npm run dev`, c'est ce fichier qui traduit ta commande en "Lance Next.js en mode développement".

#### `.env.example`
*   **Chemin :** `./.env.example`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/.env.example)
*   **C'est quoi ?** Le trousseau de clés (factice).
*   **Détail :** Notre site a besoin de secrets pour fonctionner (mots de passe de base de données, clés secrètes). On ne les écrit JAMAIS dans le code (sinon les pirates les volent). Ce fichier montre *quelles* clés sont nécessaires (ex: `DATABASE_URL=`), mais laisse la valeur vide. C'est à toi de créer un fichier `.env` réel sur ton ordinateur avec les vraies clés.

#### `tsconfig.json`
*   **Chemin :** `./tsconfig.json`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/tsconfig.json)
*   **C'est quoi ?** Le professeur de grammaire.
*   **Détail :** Il dicte les règles de TypeScript. Est-ce qu'on autorise le code un peu "flou" (`any`) ou est-ce qu'on est super strict ? C'est lui qui décide comment le code est vérifié et traduit pour être compris par les navigateurs.

### Le Cœur (Dossier `app/`)
*L'endroit où vivent les pages. Si tu veux changer ce qui s'affiche à l'écran, c'est ici.*

#### `app/layout.tsx`
*   **Chemin :** `./app/layout.tsx`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/app/layout.tsx)
*   **C'est quoi ?** Le cadre du tableau.
*   **Détail :** Imagine que chaque page du site est un tableau différent. Le `layout.tsx`, c'est le cadre doré autour qui ne change jamais. Il contient les balises `<html>` et `<body>` que tu connais peut-être. Si tu veux ajouter une barre de navigation visible *partout*, tu la mets ici.

#### `app/page.tsx`
*   **Chemin :** `./app/page.tsx`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/app/page.tsx)
*   **C'est quoi ?** La scène principale.
*   **Détail :** C'est l'URL `/` (l'accueil). Ce fichier est le chef d'orchestre de la page d'accueil : il appelle le composant `TileGrid` (la grille d'images) et lui dit "Affiche-toi ici". C'est le point d'entrée de nos visiteurs.

#### `app/admin/page.tsx`
*   **Chemin :** `./app/admin/page.tsx`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/app/admin/page.tsx)
*   **C'est quoi ?** Les coulisses (VIP seulement).
*   **Détail :** Accessible via `/admin`. Ici, pas de poésie visuelle pour le public, c'est le tableau de bord pour contrôler le site : ajouter des tuiles, changer les sons, modifier la configuration. C'est protégé par un mot de passe (vérifié par `api/auth`).

### La Machinerie (Dossier `app/api/`)
*Les nains de la mine. Ils travaillent dans le noir pour aller chercher les données.* Enfin le backend quoi. Accroche toi : c'est ici que l'IA commence à suggérer des métaphores bcp trop capillo-tractées 

#### `app/api/tiles/route.ts`
*   **Chemin :** `./app/api/tiles/route.ts`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/app/api/tiles/route.ts)
*   **C'est quoi ?** Le serveur au restaurant.
*   **Détail :** Le site (le client à table) demande "Je veux voir le menu (les tuiles)". Ce fichier reçoit la commande, court en cuisine (la base de données), récupère la liste des tuiles, et la sert au client au format JSON.

#### `app/api/auth/login/route.ts`
*   **Chemin :** `./app/api/auth/login/route.ts`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/app/api/auth/login/route.ts)
*   **C'est quoi ?** Le videur de la boîte de nuit.
*   **Détail :** Quand tu tapes ton mot de passe sur la page admin, il est envoyé ici. Ce fichier compare ce que tu as tapé avec le mot de passe secret (dans le `.env`). Si ça matche, il te donne un tampon sur la main (un cookie de session) pour entrer. Sinon, dehors !

#### `app/api/images/route.ts`
*   **Chemin :** `./app/api/images/route.ts`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/app/api/images/route.ts)
*   **C'est quoi ?** L'archiviste du musée.
*   **Détail :** Quand tu ajoutes une image sur le site, c'est lui qui la reçoit. Il ne la garde pas dans sa poche : il l'envoie vers un stockage sécurisé dans le nuage (Blob Storage) pour qu'elle soit accessible partout dans le monde, tout le temps.

#### `app/api/sounds/route.ts`
*   **Chemin :** `./app/api/sounds/route.ts`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/app/api/sounds/route.ts)
*   **C'est quoi ?** Le DJ de la soirée.
*   **Détail :** Tout comme pour les images, ce fichier gère l'upload et la liste des sons d'ambiance. Il s'assure que chaque fichier audio est bien rangé et prêt à être joué quand on survole une tuile.

### Les Briques (Dossier `components/`)

Les LEGO visuels qu'on réutilise partout.

#### `components/TileGrid.tsx`
*   **Chemin :** `./components/TileGrid.tsx`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/components/TileGrid.tsx)
*   **À quoi ça sert ?** C'est le mur d'images. Ce composant est intelligent : il prend la liste des tuiles et les arrange joliment sur l'écran (façon "Masonry").

#### `components/Tile.tsx`
*   **Chemin :** `./components/Tile.tsx`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/components/Tile.tsx)
*   **À quoi ça sert ?** Une brique unique. Elle gère l'affichage d'une seule image, et si on clique dessus, elle joue le son associé ou ouvre la modale.

#### `components/TileModal.tsx`
*   **Chemin :** `./components/TileModal.tsx`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/components/TileModal.tsx)
*   **C'est quoi ?** La loupe géante.
*   **Détail :** C'est ce qui apparaît "par-dessus" le site quand tu cliques sur une tuile. Il permet de voir l'image en haute qualité et lire les détails sans quitter la page d'accueil.

#### `components/Toast.tsx`
*   **Chemin :** `./components/Toast.tsx`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/components/Toast.tsx)
*   **C'est quoi ?** Le messager royal.
*   **Détail :** C'est une petite notification qui apparaît brièvement (souvent en bas de l'écran) pour dire "Sauvegarde réussie !" ou "Erreur !". Il délivre son message et disparaît discrètement.

### Les Outils de l'Ombre (Dossier `components/admin/`)
*Les leviers de commande cachés pour gérer le spectacle.*

#### `components/admin/LoginForm.tsx`
*   **Chemin :** `./components/admin/LoginForm.tsx`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/components/admin/LoginForm.tsx)
*   **C'est quoi ?** Le digicode à l'entrée.
*   **Détail :** Le petit formulaire où tu tapes ton mot de passe pour entrer dans l'admin. Simple, efficace, mais intransigeant.

#### `components/admin/TileForm.tsx`
*   **Chemin :** `./components/admin/TileForm.tsx`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/components/admin/TileForm.tsx)
*   **C'est quoi ?** L'atelier de poterie.
*   **Détail :** C'est ici que tu fabriques ou modifies une tuile. Tu choisis l'image, tu assignes un son, tu donnes un titre. C'est l'établi du créateur.

### La Sagesse (Dossier `lib/`)

Le code "utilitaire" qui ne sert pas à l'affichage direct, mais qui aide tout le monde.

#### `lib/db.ts`
*   **Chemin :** `./lib/db.ts`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/lib/db.ts)
*   **C'est quoi ?** Le tunnel vers le coffre-fort.
*   **Détail :** C'est un fichier critique. Il crée la connexion sécurisée vers Neon (notre base de données). Partout ailleurs dans le code, quand on veut parler à la base, on importe ce fichier. S'il est cassé, le site est amnésique.

#### `lib/auth.ts`
*   **Chemin :** `./lib/auth.ts`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/lib/auth.ts)
*   **C'est quoi ?** Le code de la route.
*   **Détail :** C'est le livre de règles qui définit *comment* on vérifie l'identité de quelqu'un. Il contient les fonctions pour créer les sessions sécurisées (JWT) et vérifier si un utilisateur a le droit d'être là.

#### `lib/client-utils.ts`
*   **Chemin :** `./lib/client-utils.ts`
*   [Voir le code sur GitHub](https://github.com/mitchlabeetch/o2paris/blob/main/lib/client-utils.ts)
*   **C'est quoi ?** Le couteau suisse de MacGyver.
*   **Détail :** Il contient des petites fonctions pratiques qu'on ne savait pas où ranger ailleurs. Par exemple : une fonction pour mélanger une liste au hasard (pour que les tuiles ne soient pas toujours dans le même ordre), ou une fonction pour calculer des délais.

---

## 4. L'Armurerie Secrète (Outils Avancés)

Parce qu'un bon chevalier doit connaître toutes ses armes, voici les fichiers que j'avais cachés sous le tapis pour ne pas t'effrayer.

#### `init_db.js` (à la racine)
*   **C'est quoi ?** Le sort de Genèse (Big Bang).
*   **Détail :** Ce script ne sert qu'une seule fois (ou en cas de catastrophe). Il sert à créer les tables de la base de données (le "schéma") si elles n'existent pas. C'est lui qui dit à Neon : "Je veux une table pour ranger des 'tuiles' avec un 'titre' et une 'image'".

#### `verify_tiles_db.js` (à la racine)
*   **C'est quoi ?** L'inspecteur des travaux finis.
*   **Détail :** Un petit script de diagnostic. Si tu as un doute sur ce qu'il y a dans la base de données mais que tu ne veux pas lancer tout le site, tu lances ce script et il t'affiche le contenu brut. Pratique pour vérifier si une sauvegarde a marché.

#### `tailwind.config.ts` (à la racine)
*   **C'est quoi ?** La palette du peintre.
*   **Détail :** C'est ici qu'on définit nos "couleurs officielles", nos polices d'écriture, et nos tailles d'écran. Si un jour tu veux changer le "rouge" du site partout d'un coup, c'est ici que ça se passe.

---

## 5. Le Cycle de la Vie (Workflow)

Comment ton code passe-t-il de ton clavier à l'écran de ton téléphone ? C'est un voyage en trois étapes.

1.  **Ton Ordinateur (Local)** : C'est ton atelier. Tu modifies le code, tu casses des choses, tu répares. Personne ne voit ce que tu fais à part toi.
    *   *Commande clé :* `npm run dev` (pour voir le résultat sur ton écran).

2.  **GitHub (Le Grimoire Commun)** : C'est la bibliothèque centrale. Quand tu es content de ton travail, tu l'envoies ici ("Push"). C'est une sauvegarde sécurisée et partagée.
    *   *Action clé :* "Commit" (Sauvegarder) puis "Push" (Envoyer).

3.  **Vercel (Le Monde Réel)** : C'est la scène. Vercel surveille GitHub jour et nuit. Dès qu'il voit que tu as envoyé une modification sur GitHub, il la télécharge, construit le site, et le met à jour pour le monde entier en quelques secondes.
    *   *Action clé :* Rien ! C'est automatique. Magique, non ?

---

## 6. Le Lexique des Sortilèges

Quelques mots barbares traduits en langage humain pour briller en société (ou juste comprendre ce que je raconte).

*   **Component (Composant) :** Une pièce de LEGO. Un bouton, un menu, une image. On assemble des composants pour faire une page.
*   **Props (Propriétés) :** Les instructions qu'on donne à un composant. Ex: Pour le composant `Bouton`, la prop `couleur="rouge"` est une instruction.
*   **State (État) :** La mémoire à court terme d'un composant. Ex: "Est-ce que ce menu est ouvert ou fermé ?" C'est un état.
*   **API (Application Programming Interface) :** Le serveur. C'est la partie du code qui ne dessine rien mais qui répond aux questions (ex: "Donne-moi la liste des utilisateurs").
*   **Commit :** Un point de sauvegarde. Comme dans un jeu vidéo avant un boss. Si tu fais une bêtise après, tu peux revenir à ce point.
*   **Deploy (Déploiement) :** L'acte de mettre le site en ligne. Passer de "ça marche chez moi" à "ça marche pour tout le monde".

---