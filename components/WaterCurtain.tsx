'use client';

import { useState, useEffect } from 'react';

export default function WaterCurtain() {
  const [show, setShow] = useState(true);
  const [config, setConfig] = useState<any>({
    overlay_icon: '💧',
    app_title: 'O2Paris',
  });

  useEffect(() => {
    // Load config for overlay icon
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(console.error);

    // Updated to 2200ms to match the new 2s animation duration (with 200ms buffer)
    const timer = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="water-curtain-overlay">
      <div className="water-curtain-wave" />
      <div className="flex items-center justify-center h-full flex-col">
        <span className="text-6xl water-curtain-droplet">
          {config.overlay_icon || '💧'}
        </span>
        <h2 className="text-white text-2xl font-bold mt-4 tracking-wider text-shadow-water">
          {config.app_title || 'O2Paris'}
        </h2>
        <p className="text-white/80 text-sm mt-2 tracking-widest uppercase">
          Carte Sonore Interactive
        </p>
      </div>
    </div>
  );
}
