/**
 * -----------------------------------------------------------------------------
 * FICHIER : tailwind.config.ts
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est la "Palette de Couleurs" du projet Tailwind CSS.
 * Tailwind utilise ce fichier pour savoir quelles classes CSS générer.
 *
 * FONCTIONNEMENT :
 * 1. "content" : Indique à Tailwind quels fichiers scanner pour les classes.
 * 2. "theme.extend" : Ajoute des couleurs personnalisées au thème par défaut.
 * 3. Les couleurs "water" deviennent accessibles comme bg-water-main, etc.
 *
 * REPÈRES :
 * - Lignes 24-31 : Définition des couleurs personnalisées ("water").
 * - Les 5 nuances couvrent du clair au foncé (gradient eau).
 * - "DEFAULT" et "main" sont identiques (interchangeables).
 *
 * UTILISATION :
 * - Dans le HTML : <button className="bg-water-main text-white">
 * - Dans le CSS global (globals.css) : var(--water-main) ou var(--water-light)
 * - Tailwind génère les classes CSS basées sur ces définitions.
 *
 * HARMONISATION :
 * - Les couleurs "water" doivent correspondre à celles de globals.css (variables CSS).
 * - Voir globals.css lignes 34-40 pour les variables racines (:root).
 * - Cohérence : Si on change une couleur, le faire dans DEUX endroits.
 *
 * NOTES :
 * - Tailwind optimise les CSS générés : seules les classes utilisées sont incluses.
 * - Les fichiers "pages" ne sont pas utilisés ici (Next.js utilise "app").
 * - Les plugins sont vides pour l'instant (extensible si besoin).
 *
 * PLUGINS POSSIBLES :
 * - On pourrait ajouter tailwindcss/forms pour styliser les inputs.
 * - On pourrait ajouter @tailwindcss/typography pour les articles.
 * - Voir https://tailwindcss.com/docs/plugins pour la liste.
 *
 * PALETTE "WATER" EXPLIQUÉE :
 * - light (#E3F2FD)   : Fond clair, arrière-plans pastels.
 * - main (#2196F3)    : Couleur principale, boutons, liens.
 * - dark (#1565C0)    : Zones sombres, texte sur fond clair.
 * - deep (#0D47A1)    : Contraste maximum, bordures, ombres.
 * - DEFAULT           : Alias pour "main" (compatibilité).
 * 
 * LIEN AVEC GLOBALS.CSS :
 * - globals.css définit des variables CSS (--water-light, etc).
 * - tailwind.config.ts fournit les classes Tailwind (bg-water-light, etc).
 * - Les deux travaillent ensemble pour une cohérence maximale.
 *
 * EXTENSION FUTURE :
 * - Ajouter d'autres couleurs si le design change.
 * - Exemple : { sky: { ... }, forest: { ... } }
 * - Chaque couleur peut avoir 5-10 nuances (light → deep).
 *
 * EXEMPLE D'EXTENSION :
 * ```typescript
 * colors: {
 *   water: { light: '#E3F2FD', ... },
 *   sky: { light: '#E1F5FF', main: '#0277BD', dark: '#01579B' },
 *   forest: { light: '#E8F5E9', main: '#2E7D32', dark: '#1B5E20' },
 * }
 * ```
 * 
 * Puis utiliser dans le HTML :
 * ```jsx
 * <div className="bg-sky-light text-forest-dark border-water-main">
 * ```
 *
 * PERFORMANCES :
 * - Tailwind ne génère que les classes utilisées (purge automatique).
 * - Les fichiers de production sont très optimisés.
 * - Aucun CSS "mort" n'est inclus.
 *
 * FICHIER COMPLET :
 * - Simple et structuré : facile à étendre.
 * - Pas de logique complexe : juste une configuration déclarative.
 * - Compatible avec les versions récentes de Tailwind (v3+).
 * 
 * REPÈRES FINAUX :
 * - Lignes 24-31 : Les couleurs personnalisées.
 * - Si on veut plus de classes CSS, les ajouter dans "theme.extend".
 * - Les commentaires ci-dessus expliquent la stratégie.
 * 
 * LIEN AVEC D'AUTRES FICHIERS :
 * - app/globals.css : Variables CSS (:root) et styles globaux.
 * - components/Map.tsx : Utilise les classes (bg-water-main).
 * - lib/db.ts : Défini les couleurs par défaut en base de données.
 * - app/admin/page.tsx : Permet de changer les couleurs via un formulaire.
 * 
 * DÉPENDANCES :
 * - Tailwind CSS version 3.0 ou plus récente.
 * - Next.js 13+ (utilise app directory).
 * - PostCSS (compilateur CSS).
 * 
 * IMPORTS ET EXPORTS :
 * - Import : `import type { Config } from "tailwindcss"`
 * - Export : `export default config`
 * - Utilisé automatiquement par Tailwind lors du build.
 * 
 * FICHIER MINIMAL :
 * - Ce fichier est minimaliste pour ne pas surcharger.
 * - Des projets plus complexes pourraient avoir 50+ lignes.
 * - Voir la documentation Tailwind pour des exemples avancés.
 * 
 * MIGRATION VERS D'AUTRES FRAMEWORKS :
 * - Si on passe à Svelte, le format est similaire.
 * - Si on passe à Vue, même structure.
 * - Si on passe à CSS-in-JS, refactoriser.
 * 
 * CONCLUSION :
 * - Ce fichier de config fait le lien entre Tailwind et le design du site.
 * - Modifier les couleurs ici se reflète partout en utilisant les classes.
 * - La palette "water" est le thème principal et emblématique du site.
 * 
 * Voir : https://tailwindcss.com/docs/theme pour plus d'infos.
 * Voir : https://tailwindcss.com/docs/customization/colors pour les couleurs.
 * 
 * _____________________________________________________________________________
 * FIN DE LA DOCUMENTATION
 * _____________________________________________________________________________
 */

import type { Config } from "tailwindcss";

const config: Config = {
  // ---------------------------------------------------------------------------
  // CONTENU À ANALYSER
  // ---------------------------------------------------------------------------
  // Tailwind scanne ces fichiers pour trouver les classes à générer.
  // N'incluir que les répertoires avec du code React/JSX.
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ---------------------------------------------------------------------------
      // COULEURS PERSONNALISÉES
      // ---------------------------------------------------------------------------
      // Ajout des couleurs "water" au thème Tailwind.
      // Ces couleurs deviennent accessibles avec les classes Tailwind :
      // - bg-water-light : Fond clair (#E3F2FD)
      // - bg-water-main : Couleur principale (#2196F3)
      // - bg-water-dark : Couleur foncée (#1565C0)
      // - bg-water-deep : Couleur très foncée (#0D47A1)
      // - text-water-main : Texte de couleur eau
      // - border-water-light : Bordure claire
      // ... et beaucoup d'autres combinaisons automatiquement générées par Tailwind
      colors: {
        water: {
          light: '#E3F2FD',      // Bleu clair pour les fonds (pastels)
          DEFAULT: '#2196F3',    // Alias pour "main"
          main: '#2196F3',       // Bleu principal (boutons, liens)
          dark: '#1565C0',       // Bleu foncé (texte, zones sombres)
          deep: '#0D47A1',       // Bleu très foncé (contrastes max)
        },
      },
    },
  },
  plugins: [],
};
export default config;
