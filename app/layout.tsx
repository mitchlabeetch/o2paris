/**
 * -----------------------------------------------------------------------------
 * FICHIER : app/layout.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le "cadre" principal de l'application. Ce fichier définit la structure HTML
 * de base (<html>, <body>) qui sera partagée par TOUTES les pages du site.
 *
 * FONCTIONNEMENT :
 * Dans Next.js (App Router), le "RootLayout" est le parent ultime.
 * Tout ce que nous écrivons ici (comme les polices d'écriture ou le CSS global)
 * s'appliquera partout.
 *
 * CONNEXIONS :
 * - Importe "globals.css" pour appliquer le style à tout le site.
 * - Reçoit "children" : c'est la page spécifique que l'utilisateur visite
 *   (par exemple, le contenu de page.tsx ou admin/page.tsx) qui sera insérée
 *   à l'intérieur de la balise <body>.
 *
 * REPÈRES :
 * - Lignes 28-34 : Configuration du SEO (Titre, Description pour Google).
 * - Lignes 39-46 : Configuration de l'affichage mobile (Viewport).
 * - Lignes 53+   : La fonction RootLayout qui construit le HTML.
 * -----------------------------------------------------------------------------
 */

// Importation des types nécessaires pour Next.js (SEO et Viewport)
import type { Metadata, Viewport } from "next";
// Importation du fichier CSS global (c'est ici qu'on charge Tailwind pour tout le site)
import "./globals.css";
// import "leaflet/dist/leaflet.css"; // Leaflet no longer primary, but keeping for admin map or future use

// -----------------------------------------------------------------------------
// CONFIGURATION SEO (MÉTADONNÉES)
// -----------------------------------------------------------------------------
// Ces informations sont lues par les moteurs de recherche (Google) et les réseaux sociaux
// quand on partage le lien du site.
export const metadata: Metadata = {
  title: "O2Paris - Expérience Visuelle & Sonore",
  description: "Une balade immersive à travers Paris.",
  keywords: ["Paris", "Photo", "Son", "Art", "Expérience"],
  authors: [{ name: "O2Paris Team" }],
};

// -----------------------------------------------------------------------------
// CONFIGURATION VIEWPORT (MOBILE)
// -----------------------------------------------------------------------------
// Définit comment le site s'affiche sur les écrans (zoom, échelle).
// Ici, on bloque le zoom utilisateur pour une expérience plus "app native".
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Empêche le zoom manuel
  themeColor: "#000000",
};

// -----------------------------------------------------------------------------
// COMPOSANT PRINCIPAL (LAYOUT)
// -----------------------------------------------------------------------------
// Cette fonction reçoit "children" (la page active) et l'enveloppe dans les balises
// HTML standard.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // La balise <html> racine, avec la langue définie sur français
    <html lang="fr">
      <head>
        {/* Chargement des polices Google Fonts (Cinzel, Lato, etc.) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Dancing+Script:wght@400;700&family=Lato:wght@300;400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      {/* 
        Le body applique les styles de base (police sans-serif, antialiasing).
        {children} est l'endroit exact où le contenu de la page (ex: app/page.tsx) sera injecté.
      */}
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}