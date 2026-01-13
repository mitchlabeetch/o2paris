/**
 * FICHIER : next.config.js
 * RÔLE : Configuration de Next.js et du builder webpack.
 * CONFIG : Externe 'canvas' (librairie pour manipulation d'images/graphiques).
 * Utilité : canvas n'est pas disponible en SSR, must être lazy-loaded côté client.
 * Build : Next.js utilise Webpack en interne, on customise ici les configs.
 * Note : Minimal config (juste le webpack customization).
 * Futur : Peut inclure redirects, rewrites, image optimization, etc.
 * _____________________________________________________________________________
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
}

module.exports = nextConfig
