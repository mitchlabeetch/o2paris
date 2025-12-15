'use client';

import { useState } from 'react';

interface MapOverlayProps {
  onSearch: (query: string) => void;
  onLocate: () => void;
}

export default function MapOverlay({ onSearch, onLocate }: MapOverlayProps) {
  const [query, setQuery] = useState('');
  const [showAbout, setShowAbout] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <>
      <div className="absolute top-4 left-4 z-[1000] w-[90%] max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-water-main/20">
          <div className="p-4 bg-gradient-to-r from-water-main to-water-dark text-white flex justify-between items-center">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wide">O2Paris</h1>
              <p className="text-sm font-light text-water-light opacity-90">Voyage Sonore au Fil de l&apos;Eau</p>
            </div>
            <button
              onClick={() => setShowAbout(true)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="À propos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Rechercher un point d'écoute..."
                className="w-full pl-10 pr-4 py-3 bg-water-light/30 border border-water-main/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-water-main focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400 font-sans"
              />
              <svg
                className="absolute left-3 top-3.5 text-water-main w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <a
        href="/admin"
        className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm text-water-dark p-2.5 rounded-full shadow-lg hover:bg-water-main hover:text-white transition-all duration-300 border border-water-main/20 group"
        title="Administration"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </a>

      {showAbout && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative">
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="bg-gradient-to-br from-water-main to-water-dark p-8 text-white text-center">
              <h2 className="font-serif text-3xl font-bold mb-2">À propos</h2>
              <p className="text-water-light text-sm uppercase tracking-widest">Eau de Paris</p>
            </div>

            <div className="p-8 space-y-4 text-gray-600 leading-relaxed font-sans">
              <p>
                <strong className="text-water-dark">O2Paris</strong> est une expérience cartographique et sonore immersive qui vous invite à redécouvrir la ville à travers l&apos;élément liquide.
              </p>
              <p>
                Explorez les fontaines, les canaux et les berges de Seine. Chaque point sur la carte révèle une ambiance sonore unique, capturée au cœur de Paris.
              </p>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-6">
                <h3 className="font-bold text-water-dark mb-2 text-sm">Comment ça marche ?</h3>
                <ul className="text-sm space-y-2 list-disc list-inside">
                  <li>Naviguez sur la carte interactive.</li>
                  <li>Cliquez sur les gouttes <span className="text-xl inline-block align-middle">💧</span> pour ouvrir un point.</li>
                  <li>Écoutez l&apos;ambiance sonore associée.</li>
                </ul>
              </div>

              <div className="pt-4 text-center text-xs text-gray-400">
                © 2024 Eau de Paris • Projet O2Paris
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
