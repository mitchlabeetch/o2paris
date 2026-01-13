/**
 * -----------------------------------------------------------------------------
 * FICHIER : components/Tile.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * Représente une "brique" individuelle dans la grille.
 * C'est l'unité de base visuelle : une image qui réagit au survol.
 *
 * FONCTIONNEMENT :
 * - Affiche l'image fournie via les "props".
 * - Gère l'animation de zoom au survol (hover).
 * - Affiche le titre et l'icône musique en surimpression au survol.
 * - Déclenche l'événement "onClick" quand on clique dessus (pour ouvrir la modale).
 *
 * REPÈRES :
 * - Lignes 26-33 : Définition des données reçues (Props).
 * - Lignes 36-37 : Calcul des styles dynamiques (police, couleur).
 * - Lignes 40+   : Rendu avec Framer Motion pour les animations fluides.
 * -----------------------------------------------------------------------------
 */

'use client';

// Import des outils d'animation (motion) et de gestion de classes CSS (clsx/twMerge)
import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// -----------------------------------------------------------------------------
// DÉFINITION DES PROPS (PARAMÈTRES)
// -----------------------------------------------------------------------------
export interface TileProps {
  id: number;
  title: string;
  image_url: string;
  sound_url?: string;
  onClick: () => void; // Fonction appelée lors du clic
  style_config?: { font?: string; color?: string }; // Styles optionnels
}

// -----------------------------------------------------------------------------
// COMPOSANT TILE
// -----------------------------------------------------------------------------
export function Tile({ title, image_url, onClick, style_config }: TileProps) {
  // Détermination de la classe CSS pour la police selon la config
  const fontClass = style_config?.font === 'Lato' ? 'font-sans' : 'font-serif';
  // Couleur du texte (blanc par défaut si non spécifié)
  const textColor = style_config?.color || '#ffffff';

  return (
    // motion.div remplace une div classique pour permettre l'animation
    <motion.div
      layout // Permet d'animer le changement de position dans la grille
      whileHover={{ scale: 1.02 }} // Petit effet de "soulèvement" au survol
      className="relative break-inside-avoid mb-4 cursor-pointer overflow-hidden rounded-xl group"
      onClick={onClick}
    >
      {/* L'image principale */}
      <img
        src={image_url}
        alt={title}
        // "group-hover:scale-110" fait zoomer l'image quand on survole le parent (motion.div)
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy" // Chargement différé pour la performance
      />

      {/* 
         Overlay (Calque de superposition) :
         Il est invisible par défaut (opacity-0) et devient visible au survol (group-hover:opacity-100).
         Contient le fond noir semi-transparent, le titre et l'icône.
      */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
        <h3
          className={twMerge("text-2xl text-center px-4 drop-shadow-md", fontClass)}
          style={{ color: textColor }}
        >
          {title}
        </h3>
        <span className="mt-2 text-3xl">🎵</span>
      </div>
    </motion.div>
  );
}