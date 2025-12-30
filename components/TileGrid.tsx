'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tile } from './Tile';
import { TileModal } from './TileModal';
import { AnimatePresence } from 'framer-motion';
import { shuffleArray } from '@/lib/client-utils';

interface TileData {
  id: number;
  title: string;
  description: string;
  image_url: string;
  sound_url: string;
  style_config: any;
}

// Number of tiles to load per infinite scroll trigger
const TILES_PER_SCROLL_CHUNK = 12;

export function TileGrid() {
  // sessionTiles: The full "deck" of tiles in a fixed random order for this session
  const [sessionTiles, setSessionTiles] = useState<TileData[]>([]);
  // displayTiles: The subset of tiles currently rendered on screen
  const [displayTiles, setDisplayTiles] = useState<TileData[]>([]);
  
  // Tracks the absolute position in the infinite cycle
  const currentIndexRef = useRef(0);
  
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // 1. INITIALIZATION: Fetch all tiles & Shuffle once
  useEffect(() => {
    const initTiles = async () => {
      try {
        const res = await fetch('/api/tiles', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        
        if (!res.ok) throw new Error('Failed to fetch tiles');
        
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          // Shuffle once to create the unique "Session Order"
          // This prevents the "ABABCDCD" pattern by ensuring the sequence is [A, B, C, D] 
          // and repeats as [A, B, C, D]... distance is always max.
          const shuffled = shuffleArray(data);
          setSessionTiles(shuffled);

          // Initial Render: Load the first chunk immediately
          // Handle case where total tiles < chunk size by looping immediately if needed
          const initialTiles: TileData[] = [];
          for (let i = 0; i < TILES_PER_SCROLL_CHUNK; i++) {
            // Use modulo to wrap around if we have fewer than 12 tiles total
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
    // No polling/interval here. We want the order to be stable for the session.
  }, []);

  // 2. INFINITE SCROLL: Refeed from the fixed sessionTiles
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        // Only load more if we have a valid session order established
        if (target.isIntersecting && sessionTiles.length > 0) {
          
          const nextChunk: TileData[] = [];
          
          // Calculate the next chunk based on the fixed session order
          // This ensures we continue the exact sequence: ... -> End -> Start -> ...
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
        rootMargin: '200px', // Preload before user hits bottom
        threshold: 0.1 
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [sessionTiles]); // Re-create observer only when the session "deck" is ready

  // Navigation Logic (Cyclical)
  // Uses sessionTiles to find the 'true' next/prev in the logical random order
  const handleNext = () => {
    if (selectedId === null || sessionTiles.length === 0) return;
    const currentSessionIndex = sessionTiles.findIndex(t => t.id === selectedId);
    if (currentSessionIndex === -1) return;
    
    const nextIndex = (currentSessionIndex + 1) % sessionTiles.length;
    setSelectedId(sessionTiles[nextIndex].id);
  };

  const handlePrev = () => {
    if (selectedId === null || sessionTiles.length === 0) return;
    const currentSessionIndex = sessionTiles.findIndex(t => t.id === selectedId);
    if (currentSessionIndex === -1) return;
    
    const prevIndex = (currentSessionIndex - 1 + sessionTiles.length) % sessionTiles.length;
    setSelectedId(sessionTiles[prevIndex].id);
  };

  const selectedTile = sessionTiles.find(t => t.id === selectedId);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Masonry Layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {displayTiles.map((tile, index) => (
          <Tile
            // Use index in key to allow duplicates (same tile appearing multiple times in infinite scroll)
            key={`${tile.id}-${index}`}
            {...tile}
            onClick={() => setSelectedId(tile.id)}
          />
        ))}
      </div>

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

      {/* Infinite Scroll Trigger */}
      {sessionTiles.length > 0 && (
        <div ref={loaderRef} className="h-24 flex items-center justify-center text-water-main/30">
          <span className="animate-spin text-3xl">∞</span>
        </div>
      )}
    </div>
  );
}
