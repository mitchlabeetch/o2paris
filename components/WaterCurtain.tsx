'use client';

import { useState, useEffect } from 'react';

export default function WaterCurtain() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="water-curtain-overlay">
      <div className="water-curtain-wave" />
      <div className="flex items-center justify-center h-full flex-col">
        <span className="text-6xl water-curtain-droplet">💧</span>
        <h2 className="text-white text-2xl font-bold mt-4 tracking-wider text-shadow-water">
          O2Paris
        </h2>
        <p className="text-white/80 text-sm mt-2 tracking-widest uppercase">
          Carte Sonore Interactive
        </p>
      </div>
    </div>
  );
}
