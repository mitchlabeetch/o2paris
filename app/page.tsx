/**
 * -----------------------------------------------------------------------------
 * FICHIER : app/page.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est la page d'accueil du site (l'URL "/").
 * Elle affiche le titre, le sous-titre, et surtout la grille de tuiles.
 *
 * FONCTIONNEMENT :
 * 1. Au chargement, elle récupère la configuration (titres, couleurs, fond) depuis l'API.
 * 2. Elle met à jour cette config toutes les 5 secondes (polling) pour que les
 *    changements faits dans l'admin soient visibles presque immédiatement.
 * 3. Elle applique le style (police, fond) dynamiquement.
 *
 * CONNEXIONS :
 * - Utilise "TileGrid" pour afficher le contenu principal.
 * - Appelle l'API "/api/config" pour savoir comment s'afficher.
 *
 * REPÈRES :
 * - Lignes 41-48 : État local (State) qui stocke la config.
 * - Lignes 54-75 : Le cycle de vie (Effect) qui va chercher les données.
 * - Lignes 81-96 : Calcul du style de l'image de fond.
 * - Lignes 101+  : Le rendu visuel (HTML).
 * -----------------------------------------------------------------------------
 */

// Indique que ce composant fonctionne côté client (navigateur) car il utilise useState/useEffect
'use client';

// Import des composants et outils nécessaires
import { TileGrid } from '@/components/TileGrid';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { MapConfig } from '@/lib/db';
import { BACKGROUND_PRESETS } from '@/lib/db';

export default function Home() {
  // ---------------------------------------------------------------------------
  // ÉTAT (STATE)
  // ---------------------------------------------------------------------------
  // On initialise la configuration avec des valeurs par défaut.
  // Ces valeurs seront écrasées dès que l'API répondra.
  const [config, setConfig] = useState<Partial<MapConfig>>({
    app_title: 'Eau de Paris',
    app_subtitle: 'Une expérience sonore et visuelle',
    font_family: 'Playfair Display',
    primary_color: '#2196f3',
    secondary_color: '#1565c0',
    background_theme: 'water',
  });

  // ---------------------------------------------------------------------------
  // EFFET (DATA FETCHING)
  // ---------------------------------------------------------------------------
  // Ce bloc s'exécute au démarrage. Il met en place un "polling" :
  // toutes les 5000ms (5s), il redemande la config au serveur.
  useEffect(() => {
    const fetchConfig = () => {
      fetch('/api/config', {
        cache: 'no-store', // On refuse le cache pour avoir toujours la version fraîche
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
        .then(res => res.json())
        .then(data => {
          // Mise à jour de l'état seulement si les données ont changé
          setConfig(prevConfig => {
            if (JSON.stringify(prevConfig) !== JSON.stringify(data)) {
              return data;
            }
            return prevConfig;
          });
        })
        .catch(console.error); // En cas d'erreur, on l'affiche dans la console
    };

    // Premier appel immédiat
    fetchConfig();
    // Appel récurrent toutes les 5 secondes
    const interval = setInterval(fetchConfig, 5000);
    // Nettoyage quand on quitte la page
    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------------------------------------------
  // LOGIQUE D'AFFICHAGE (STYLE)
  // ---------------------------------------------------------------------------
  // On détermine quelle image de fond ou quelle couleur afficher
  // en fonction de la configuration reçue.
  const backgroundTheme = config.background_theme || 'water';
  const isCustomBackground = backgroundTheme.startsWith('custom-');

  let backgroundClass = 'min-h-screen transition-colors duration-500';
  let backgroundStyle: React.CSSProperties = {
    fontFamily: config.font_family || 'Playfair Display',
  };

  if (isCustomBackground) {
    // Si c'est un fond personnalisé (uploadé), on construit l'URL de l'image
    const id = backgroundTheme.replace('custom-', '');
    backgroundStyle.backgroundImage = `url(/api/backgrounds?id=${id})`;
    backgroundClass += ' bg-cover bg-center bg-fixed bg-no-repeat';
  } else {
    // Sinon, on cherche dans les "presets" (couleurs prédéfinies)
    const preset = BACKGROUND_PRESETS.find(p => p.id === backgroundTheme);
    backgroundClass += ' ' + (preset?.cssClass || 'bg-gray-50');
  }

  // ---------------------------------------------------------------------------
  // RENDU (JSX)
  // ---------------------------------------------------------------------------
  return (
    <main 
      className={backgroundClass}
      style={backgroundStyle}
    >
      {/* Petit dégradé en haut pour la lisibilité si le fond est complexe */}
      <div className="fixed top-0 left-0 w-full z-10 bg-gradient-to-b from-white/80 to-transparent dark:from-black/80 h-24 pointer-events-none" />
      
      <div className="pt-8 pb-20">
         {/* En-tête : Titre et Sous-titre dynamiques */}
         <header className="text-center mb-12">
            <h1 
              className="text-5xl md:text-7xl font-serif mb-4 tracking-tighter drop-shadow-sm"
              style={{
                fontFamily: config.font_family || 'Playfair Display',
                color: config.primary_color || '#2196f3'
              }}
            >
              {config.app_title || 'Eau de Paris'}
            </h1>
            <p
              className="text-xl font-light italic"
              style={{ color: config.secondary_color || '#1565c0' }}
            >
              {config.app_subtitle || 'Une expérience sonore et visuelle'}
            </p>
         </header>

         {/* 
           Le composant Grille qui gère tout l'affichage des tuiles.
           On ne lui passe rien en props car il gère ses données lui-même.
         */}
         <TileGrid />
      </div>

      {/* Pied de page : Lien discret vers l'admin */}
      <footer className="fixed bottom-0 w-full p-4 flex justify-center bg-gradient-to-t from-white/50 dark:from-black/50 to-transparent z-10">
        <Link
          href="/admin"
          className="text-xs hover:opacity-75 transition-opacity uppercase tracking-widest backdrop-blur-sm px-3 py-1 rounded-full bg-white/30 dark:bg-black/30"
          style={{ color: config.secondary_color || '#666' }}
        >
          Administration
        </Link>
      </footer>
    </main>
  );
}