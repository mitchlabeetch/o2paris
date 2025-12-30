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
// Balances smooth scrolling UX with performance
const TILES_PER_SCROLL_CHUNK = 12;

export function TileGrid() {
  const [originalTiles, setOriginalTiles] = useState<TileData[]>([]);
  const [displayTiles, setDisplayTiles] = useState<TileData[]>([]);
  const [shuffledOrder, setShuffledOrder] = useState<TileData[]>([]);
  const currentIndexRef = useRef(0);
  // Keep originalTiles in a ref to avoid stale closure issues in the observer callback
  // The observer only recreates when shuffledOrder changes, so without this ref,
  // it would re-shuffle using stale tile data if tiles are updated via admin panel
  const originalTilesRef = useRef<TileData[]>([]);
  const isShufflingRef = useRef(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTiles = () => {
      fetch('/api/tiles', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
        .then(res => res.json())
        .then(data => {
          // Ensure data is an array before setting state
          if (Array.isArray(data) && data.length > 0) {
            setOriginalTiles(prevOriginal => {
              // Only update if data has actually changed
              // Note: Using JSON.stringify for simplicity. Tile arrays are moderate size
              // and changes are infrequent, so performance impact is minimal.
              if (JSON.stringify(prevOriginal) !== JSON.stringify(data)) {
                // Shuffle tiles once on page load and store the fixed order
                // This order will be infinitely repeated, ensuring tiles never
                // appear consecutively and maintaining maximum separation between
                // duplicate appearances (the entire population between repeats)
                const shuffled = shuffleArray(data);
                setShuffledOrder(shuffled);
                // Display initial chunk of tiles
                const initialChunk = shuffled.slice(0, TILES_PER_SCROLL_CHUNK);
                setDisplayTiles(initialChunk);
                currentIndexRef.current = TILES_PER_SCROLL_CHUNK;
                originalTilesRef.current = data;
                return data;
              }
              return prevOriginal;
            });
          } else if (Array.isArray(data) && data.length === 0) {
            // Empty array is valid
            setOriginalTiles([]);
            setDisplayTiles([]);
            setShuffledOrder([]);
            originalTilesRef.current = [];
            currentIndexRef.current = 0;
          }
        })
        .catch(err => console.error('Error fetching tiles:', err));
    };

    // Initial fetch
    fetchTiles();

    // Poll for tile changes every 5 seconds
    // This allows admin changes to appear on live site without manual refresh.
    // For production with high traffic, consider WebSockets or Server-Sent Events.
    const interval = setInterval(fetchTiles, 5000);

    return () => clearInterval(interval);
  }, []);

  // Infinite Scroll Logic
  useEffect(() => {
    // Reset shuffling flag when observer is recreated with new shuffled order
    isShufflingRef.current = false;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        // Prevent observer from firing while we're in the middle of re-shuffling
        if (first.isIntersecting && shuffledOrder.length > 0 && !isShufflingRef.current) {
          // Append more tiles by cycling through and re-shuffling when needed
          // Re-shuffle when we complete a full cycle to ensure true randomization
          const tilesToAdd: TileData[] = [];
          const currentIndex = currentIndexRef.current;
          
          // Build chunk by cycling through the shuffled order
          for (let i = 0; i < TILES_PER_SCROLL_CHUNK; i++) {
            const index = (currentIndex + i) % shuffledOrder.length;
            tilesToAdd.push(shuffledOrder[index]);
          }
          
          setDisplayTiles(prev => [...prev, ...tilesToAdd]);
          
          // Update current index
          const newIndex = (currentIndex + TILES_PER_SCROLL_CHUNK) % shuffledOrder.length;
          
          // If we've completed at least one full cycle, re-shuffle for next cycle
          // Wrap-around is detected when newIndex < currentIndex
          // Also re-shuffle if we're about to complete a cycle in this chunk
          const willCompleteCycle = currentIndex + TILES_PER_SCROLL_CHUNK >= shuffledOrder.length;
          const wrappedAround = newIndex < currentIndex;
          
          if (wrappedAround || willCompleteCycle) {
            // Set shuffling flag to prevent race conditions
            isShufflingRef.current = true;
            currentIndexRef.current = 0;
            setShuffledOrder(shuffleArray(originalTilesRef.current));
          } else {
            currentIndexRef.current = newIndex;
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [shuffledOrder]);


  // Handle modal navigation (cyclical)
  const handleNext = () => {
    if (selectedId === null || !Array.isArray(originalTiles) || originalTiles.length === 0) return;
    const currentIndex = originalTiles.findIndex(t => t.id === selectedId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % originalTiles.length;
    setSelectedId(originalTiles[nextIndex].id);
  };

  const handlePrev = () => {
    if (selectedId === null || !Array.isArray(originalTiles) || originalTiles.length === 0) return;
    const currentIndex = originalTiles.findIndex(t => t.id === selectedId);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + originalTiles.length) % originalTiles.length;
    setSelectedId(originalTiles[prevIndex].id);
  };

  const selectedTile = Array.isArray(originalTiles) ? originalTiles.find(t => t.id === selectedId) : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Masonry Layout using CSS Columns */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {displayTiles.map((tile, index) => (
          <Tile
            // Use index in key to allow duplicates
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
      <div ref={loaderRef} className="h-20 flex items-center justify-center text-gray-400 opacity-50">
        <span className="animate-spin text-2xl">∞</span>
      </div>
    </div>
  );
}
