/**
 * FICHIER : postcss.config.js
 * RÔLE : Configuration de PostCSS (traitement du CSS au build time).
 * PLUGINS :
 * - tailwindcss : Génère les classes CSS à partir de Tailwind.
 * - autoprefixer : Ajoute les préfixes vendor (-webkit-, -moz-, etc) pour compatibilité.
 * Flux : CSS source -> Tailwind (génère classes) -> Autoprefixer -> CSS final.
 * Requis pour : Tailwind CSS et compatibilité cross-browser.
 * _____________________________________________________________________________
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
