/**
 * -----------------------------------------------------------------------------
 * FICHIER : components/TileModal.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est la "loupe" du site. Elle affiche les détails d'une tuile en plein écran
 * par-dessus le reste du contenu.
 *
 * FONCTIONNEMENT :
 * - Affiche l'image en grand et la description.
 * - Joue automatiquement le son associé.
 * - Permet de naviguer vers la tuile suivante/précédente sans fermer la fenêtre.
 *
 * REPÈRES :
 * - Lignes 31-36 : Gestion du lecteur audio (lecture automatique).
 * - Lignes 40-44 : Animation d'apparition (Fade In).
 * - Lignes 57-79 : Partie GAUCHE (Image + Flèches de navigation).
 * - Lignes 82+   : Partie DROITE (Titre, Texte, Lecteur Audio).
 * -----------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

// Définition des propriétés attendues
interface TileModalProps {
  tile: {
    id: number;
    title: string;
    description: string;
    image_url: string;
    sound_url: string;
    style_config?: any;
  };
  onClose: () => void; // Fonction pour fermer la modale
  onNext: () => void;  // Fonction pour aller à l'image suivante
  onPrev: () => void;  // Fonction pour aller à l'image précédente
}

export function TileModal({ tile, onClose, onNext, onPrev }: TileModalProps) {
  // Référence directe vers l'élément <audio> HTML pour pouvoir le contrôler
  const audioRef = useRef<HTMLAudioElement>(null);
  const fontClass = tile.style_config?.font === 'Lato' ? 'font-sans' : 'font-serif';

  // ---------------------------------------------------------------------------
  // EFFET AUDIO
  // ---------------------------------------------------------------------------
  // À chaque fois que l'ID de la tuile change (nouvelle tuile ouverte),
  // on remet le son à zéro et on lance la lecture.
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        // On utilise catch() car les navigateurs bloquent parfois l'autoplay
        audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
    }
  }, [tile.id]);

  return (
    // Fond sombre (Overlay) qui couvre tout l'écran
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10"
      onClick={onClose} // Un clic sur le fond noir ferme la modale
    >
      {/* 
         Conteneur principal (La carte blanche)
         e.stopPropagation() empêche que le clic sur la carte ne ferme la modale
      */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-900 w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        onClick={(e: { stopPropagation: () => any; }) => e.stopPropagation()}
      >
        {/* -----------------------------------------------------------------------
            PARTIE GAUCHE (ou HAUT sur mobile) : IMAGE
           ----------------------------------------------------------------------- */}
        <div className="w-full md:w-3/5 h-1/2 md:h-full relative bg-gray-100">
           <img
            src={tile.image_url}
            alt={tile.title}
            className="w-full h-full object-cover"
           />
           {/* Boutons de navigation superposés sur l'image */}
           <button
             onClick={(e) => { e.stopPropagation(); onPrev(); }}
             className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-sm transition-all"
           >
             ←
           </button>
           <button
             onClick={(e) => { e.stopPropagation(); onNext(); }}
             className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-sm transition-all"
           >
             →
           </button>
        </div>

        {/* -----------------------------------------------------------------------
            PARTIE DROITE (ou BAS sur mobile) : CONTENU
           ----------------------------------------------------------------------- */}
        <div className="w-full md:w-2/5 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex justify-end">
               <button onClick={onClose} className="text-2xl opacity-50 hover:opacity-100">×</button>
            </div>

            <h2 className={twMerge("text-4xl md:text-5xl mb-6 text-gray-800 dark:text-white", fontClass)}>
              {tile.title}
            </h2>

            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 font-light">
              {tile.description}
            </p>
          </div>

          {/* Lecteur Audio */}
          <div className="mt-8">
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <span className="text-3xl">🎵</span>
              <div className="w-full">
                <audio
                  ref={audioRef}
                  controls
                  src={tile.sound_url}
                  className="w-full h-8"
                />
              </div>
            </div>

            {/* Navigation textuelle en bas */}
            <div className="mt-6 flex justify-between text-sm text-gray-400">
                <button onClick={onPrev} className="hover:text-gray-600 dark:hover:text-gray-200">Précédent</button>
                <button onClick={onNext} className="hover:text-gray-600 dark:hover:text-gray-200">Suivante</button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}