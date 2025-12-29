'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface TileModalProps {
  tile: {
    id: number;
    title: string;
    description: string;
    image_url: string;
    sound_url: string;
    style_config?: any;
  };
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function TileModal({ tile, onClose, onNext, onPrev }: TileModalProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fontClass = tile.style_config?.font === 'Lato' ? 'font-sans' : 'font-serif';

  // Autoplay sound on open, stop on close
  useEffect(() => {
    if (audioRef.current) {
        // Reset and play
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
    }
  }, [tile.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-900 w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Side */}
        <div className="w-full md:w-3/5 h-1/2 md:h-full relative bg-gray-100">
           <img
            src={tile.image_url}
            alt={tile.title}
            className="w-full h-full object-cover"
           />
           {/* Navigation Overlays on Image (Mobile/Desktop) */}
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

        {/* Content Side */}
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
