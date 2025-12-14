'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Pinpoint, MapConfig } from '@/lib/db';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Custom water-themed marker icon
const createWaterIcon = (icon?: string) => {
  const symbol = escapeHtml(icon?.trim() || '💧');
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: radial-gradient(circle, #E3F2FD 0%, #2196F3 100%); border: 3px solid #1565C0; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">${symbol}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

interface AudioPlayerProps {
  soundUrl: string;
}

function AudioPlayer({ soundUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(soundUrl);
    
    const handleEnded = () => setIsPlaying(false);
    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [soundUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="audio-controls">
      <button 
        onClick={togglePlay} 
        className="play-pause-btn"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  );
}

interface MapProps {
  pinpoints: Pinpoint[];
  config: MapConfig;
}

export default function Map({ pinpoints, config }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-water-light">
        <div className="text-water-dark text-xl">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[config.center_lat, config.center_lng]}
      zoom={config.zoom_level}
      style={{ height: '100vh', width: '100%' }}
      maxZoom={config.max_zoom}
      minZoom={config.min_zoom}
    >
      <TileLayer
        attribution={config.attribution}
        url={config.tile_layer_url}
      />
      {pinpoints.map((pinpoint) => (
        <Marker
          key={pinpoint.id}
          position={[pinpoint.latitude, pinpoint.longitude]}
          icon={createWaterIcon(pinpoint.icon)}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-water-dark text-lg mb-2">
                {pinpoint.title}
              </h3>
              <p className="text-gray-700 mb-3">
                {pinpoint.description}
              </p>
              <AudioPlayer soundUrl={pinpoint.sound_url} />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
