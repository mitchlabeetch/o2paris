'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tile } from './Tile';
import { TileModal } from './TileModal';
import { AnimatePresence } from 'framer-motion';

interface TileData {
  id: number;
  title: string;
  description: string;
  image_url: string;
  sound_url: string;
  style_config: any;
}

export function TileGrid() {
  const [originalTiles, setOriginalTiles] = useState<TileData[]>([]);
  const [displayTiles, setDisplayTiles] = useState<TileData[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/tiles')
      .then(res => res.json())
      .then(data => {
        setOriginalTiles(data);
        // Initial load: 3 sets of data to fill screen
        if (data.length > 0) {
            setDisplayTiles([...data, ...data, ...data]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Infinite Scroll Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && originalTiles.length > 0) {
          // Append more tiles when bottom is reached
          setDisplayTiles(prev => [...prev, ...originalTiles]);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [originalTiles]);


  // Handle modal navigation (cyclical)
  const handleNext = () => {
    if (selectedId === null) return;
    const currentIndex = originalTiles.findIndex(t => t.id === selectedId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % originalTiles.length;
    setSelectedId(originalTiles[nextIndex].id);
  };

  const handlePrev = () => {
    if (selectedId === null) return;
    const currentIndex = originalTiles.findIndex(t => t.id === selectedId);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + originalTiles.length) % originalTiles.length;
    setSelectedId(originalTiles[prevIndex].id);
  };

  const selectedTile = originalTiles.find(t => t.id === selectedId);

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
