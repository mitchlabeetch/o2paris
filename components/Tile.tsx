'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TileProps {
  id: number;
  title: string;
  image_url: string;
  sound_url?: string;
  onClick: () => void;
  style_config?: { font?: string; color?: string };
}

export function Tile({ title, image_url, onClick, style_config }: TileProps) {
  const fontClass = style_config?.font === 'Lato' ? 'font-sans' : 'font-serif';
  const textColor = style_config?.color || '#ffffff';

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      className="relative break-inside-avoid mb-4 cursor-pointer overflow-hidden rounded-xl group"
      onClick={onClick}
    >
      <img
        src={image_url}
        alt={title}
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />

      {/* Overlay */}
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
