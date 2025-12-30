'use client';

import { TileGrid } from '@/components/TileGrid';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { MapConfig } from '@/lib/db';
import { BACKGROUND_PRESETS } from '@/lib/db';

export default function Home() {
  const [config, setConfig] = useState<Partial<MapConfig>>({
    app_title: 'Eau de Paris',
    app_subtitle: 'Une expérience sonore et visuelle',
    font_family: 'Playfair Display',
    primary_color: '#2196f3',
    secondary_color: '#1565c0',
    background_theme: 'water',
  });

  useEffect(() => {
    const fetchConfig = () => {
      fetch('/api/config', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
        .then(res => res.json())
        .then(data => {
          setConfig(prevConfig => {
            if (JSON.stringify(prevConfig) !== JSON.stringify(data)) {
              return data;
            }
            return prevConfig;
          });
        })
        .catch(console.error);
    };

    fetchConfig();
    const interval = setInterval(fetchConfig, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate background styles
  const backgroundTheme = config.background_theme || 'water';
  const isCustomBackground = backgroundTheme.startsWith('custom-');

  let backgroundClass = 'min-h-screen transition-colors duration-500';
  let backgroundStyle: React.CSSProperties = {
    fontFamily: config.font_family || 'Playfair Display',
  };

  if (isCustomBackground) {
    const id = backgroundTheme.replace('custom-', '');
    backgroundStyle.backgroundImage = `url(/api/backgrounds?id=${id})`;
    backgroundClass += ' bg-cover bg-center bg-fixed bg-no-repeat';
  } else {
    const preset = BACKGROUND_PRESETS.find(p => p.id === backgroundTheme);
    backgroundClass += ' ' + (preset?.cssClass || 'bg-gray-50');
  }

  return (
    <main 
      className={backgroundClass}
      style={backgroundStyle}
    >
      <div className="fixed top-0 left-0 w-full z-10 bg-gradient-to-b from-white/80 to-transparent dark:from-black/80 h-24 pointer-events-none" />
      
      <div className="pt-8 pb-20">
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

         <TileGrid />
      </div>

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
