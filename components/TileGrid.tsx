/**
 * -----------------------------------------------------------------------------
 * FICHIER : components/TileGrid.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le "mur" d'images principal du site. Il gère l'affichage des tuiles,
 * le mélange aléatoire, et le défilement infini.
 *
 * FONCTIONNEMENT :
 * 1. Au chargement, il récupère toutes les tuiles disponibles.
 * 2. Il les mélange aléatoirement (en évitant les doublons visuels côte à côte).
 * 3. Il les affiche en colonnes (Layout "Masonry").
 * 4. Quand l'utilisateur descend, il recharge les mêmes tuiles en boucle pour
 *    créer une impression d'infini.
 *
 * REPÈRES :
 * - Lignes 41-45 : États (State) pour stocker les listes de tuiles.
 * - Lignes 50-96 : Chargement initial et mélange (Shuffle).
 * - Lignes 99-125 : Détection du bas de page (Scroll Infini).
 * - Lignes 153+  : Affichage HTML (Colonnes CSS).
 * -----------------------------------------------------------------------------
 */

'use client';

// Import des dépendances
import React, { useState, useEffect, useRef } from 'react';
import { Tile } from './Tile';
import { TileModal } from './TileModal';
import { AnimatePresence } from 'framer-motion'; // Pour l'animation d'ouverture/fermeture de la modale
import { shuffleArrayNoDuplicates } from '@/lib/client-utils'; // Notre algorithme de mélange intelligent

// Définition de la structure d'une tuile (Typage TypeScript)
interface TileData {
  id: number;
  title: string;
  description: string;
  image_url: string;
  sound_url: string;
  style_config: any;
}

// -----------------------------------------------------------------------------
// CONSTANTES DE CONFIGURATION
// -----------------------------------------------------------------------------
// Nombre de tuiles à ajouter à chaque fois qu'on touche le fond de la page
const TILES_PER_SCROLL_CHUNK = 12;
// Distance (en pixels) avant le bas de page où on commence à charger la suite
// (pour que ce soit invisible pour l'utilisateur)
const SCROLL_PRELOAD_DISTANCE = '200px';

export function TileGrid() {
  // ---------------------------------------------------------------------------
  // ÉTATS (MÉMOIRE DU COMPOSANT)
  // ---------------------------------------------------------------------------
  
  // sessionTiles : C'est notre "paquet de cartes" complet, mélangé une seule fois au début.
  // L'ordre reste fixe pour toute la visite pour ne pas perdre l'utilisateur.
  const [sessionTiles, setSessionTiles] = useState<TileData[]>([]);
  
  // displayTiles : C'est ce qui est réellement affiché à l'écran.
  // Cette liste grandit indéfiniment quand on scrolle.
  const [displayTiles, setDisplayTiles] = useState<TileData[]>([]);
  
  // Garde en mémoire où on en est dans notre "paquet" (index absolu)
  const currentIndexRef = useRef(0);
  
  // ID de la tuile actuellement ouverte en grand (null = aucune)
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Référence vers l'élément HTML invisible en bas de page qui sert de déclencheur
  const loaderRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // 1. INITIALISATION (CHARGEMENT & MÉLANGE)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const initTiles = async () => {
      try {
        // Appel à l'API pour récupérer les données brutes
        const res = await fetch('/api/tiles', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        
        if (!res.ok) throw new Error('Failed to fetch tiles');
        
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          // MÉLANGE INTELLIGENT :
          // On utilise notre utilitaire pour mélanger tout en évitant
          // que deux images identiques se suivent.
          const shuffled = shuffleArrayNoDuplicates(
            data,
            (a, b) => a.image_url === b.image_url
          );
          setSessionTiles(shuffled);

          // CHARGEMENT INITIAL :
          // On prend les X premières tuiles pour remplir l'écran immédiatement.
          // On utilise le modulo (%) pour boucler si on a moins de tuiles que la taille du chunk.
          const initialTiles: TileData[] = [];
          for (let i = 0; i < TILES_PER_SCROLL_CHUNK; i++) {
            initialTiles.push(shuffled[i % shuffled.length]);
          }
          
          setDisplayTiles(initialTiles);
          currentIndexRef.current = TILES_PER_SCROLL_CHUNK;
        } else {
          setSessionTiles([]);
          setDisplayTiles([]);
        }
      } catch (err) {
        console.error('Error loading tiles:', err);
      }
    };

    initTiles();
  }, []);

  // ---------------------------------------------------------------------------
  // 2. SCROLL INFINI (BOUCLE)
  // ---------------------------------------------------------------------------
  // On utilise un "IntersectionObserver" : c'est un vigie qui nous prévient
  // quand l'élément "loaderRef" (le bas de page) devient visible.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        // Si le bas de page est visible et qu'on a des tuiles chargées...
        if (target.isIntersecting && sessionTiles.length > 0) {
          
          const nextChunk: TileData[] = [];
          
          // ... on ajoute le paquet suivant.
          // L'astuce ici est d'utiliser le modulo (%) sur "sessionTiles"
          // pour recommencer au début du paquet quand on arrive à la fin.
          // Ça crée une boucle infinie parfaite sans saut visuel.
          for (let i = 0; i < TILES_PER_SCROLL_CHUNK; i++) {
            const absoluteIndex = currentIndexRef.current + i;
            const wrappedIndex = absoluteIndex % sessionTiles.length;
            nextChunk.push(sessionTiles[wrappedIndex]);
          }

          setDisplayTiles((prev) => [...prev, ...nextChunk]);
          currentIndexRef.current += TILES_PER_SCROLL_CHUNK;
        }
      },
      { 
        rootMargin: SCROLL_PRELOAD_DISTANCE, // On charge un peu en avance
        threshold: 0.1 
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [sessionTiles]); // On recrée l'observateur seulement quand le paquet initial change

  // ---------------------------------------------------------------------------
  // LOGIQUE DE NAVIGATION (MODALE)
  // ---------------------------------------------------------------------------
  // Ces fonctions permettent de faire "Suivant/Précédent" quand une image est ouverte.
  // Elles naviguent dans l'ordre logique du "paquet mélangé" (sessionTiles).

  const handleNext = () => {
    if (selectedId === null || sessionTiles.length === 0) return;
    const currentSessionIndex = sessionTiles.findIndex(t => t.id === selectedId);
    if (currentSessionIndex === -1) return;
    
    // Modulo pour revenir au début si on est à la fin
    const nextIndex = (currentSessionIndex + 1) % sessionTiles.length;
    setSelectedId(sessionTiles[nextIndex].id);
  };

  const handlePrev = () => {
    if (selectedId === null || sessionTiles.length === 0) return;
    const currentSessionIndex = sessionTiles.findIndex(t => t.id === selectedId);
    if (currentSessionIndex === -1) return;
    
    // Formule magique pour gérer le précédent quand on est au début (éviter index -1)
    const prevIndex = (currentSessionIndex - 1 + sessionTiles.length) % sessionTiles.length;
    setSelectedId(sessionTiles[prevIndex].id);
  };

  // Trouve l'objet complet de la tuile sélectionnée
  const selectedTile = sessionTiles.find(t => t.id === selectedId);

  // ---------------------------------------------------------------------------
  // RENDU VISUEL (JSX)
  // ---------------------------------------------------------------------------
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 
         LAYOUT MASONRY :
         On utilise les classes Tailwind 'columns-x' qui distribuent automatiquement
         les éléments en colonnes comme dans un journal ou Pinterest.
         gap-4 = espace entre les tuiles.
      */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {displayTiles.map((tile, index) => (
          <Tile
            // L'index est inclus dans la clé car en scroll infini, le même ID
            // peut apparaître plusieurs fois. La clé doit être unique dans le DOM.
            key={`${tile.id}-${index}`}
            {...tile}
            onClick={() => setSelectedId(tile.id)}
          />
        ))}
      </div>

      {/* 
         MODALE :
         AnimatePresence permet à la modale de jouer son animation de SORTIE
         avant de disparaître du DOM.
      */}
      <AnimatePresence>
        {selectedTile && (
          <TileModal
            tile={selectedTile}
            onClose={() => setSelectedId(null)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
      </AnimatePresence>

      {/* 
         TRIGGER SCROLL INFINI :
         C'est cet élément invisible (ou avec le signe infini) en bas de page
         que l'IntersectionObserver surveille.
      */}
      {sessionTiles.length > 0 && (
        <div ref={loaderRef} className="h-24 flex items-center justify-center text-water-main/30">
          <span className="animate-spin text-3xl">∞</span>
        </div>
      )}
    </div>
  );
}