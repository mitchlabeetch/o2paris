'use client';

import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Pinpoint, MapConfig } from '@/lib/db';
import { FALLBACK_SOUND_URL } from '@/lib/fallbackAudio';

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
  const raw = (icon || '💧').trim();
  // Allow only short, safe symbols (letters, numbers, emoji). Default otherwise.
  const emojiSafePattern = /^(?:[A-Za-z0-9]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83E[\uDD00-\uDDFF]){1,4}$/;
  const safe = emojiSafePattern.test(raw) ? raw : '💧';
  const symbol = escapeHtml(safe);
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackAppliedRef = useRef(false);
  const LOAD_ERROR_MESSAGE = 'Impossible de charger le son';

  const handlePlaybackFailure = (message: string) => {
    setError(message);
    setIsPlaying(false);
    setIsLoading(false);
  };

  const playFallbackAudio = useCallback(async () => {
    if (!audioRef.current) {
      return false;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
      return true;
    } catch (fallbackErr) {
      console.error('Error playing fallback audio:', fallbackErr);
      return false;
    }
  }, []);

  const applyFallback = useCallback(async (shouldPlay: boolean) => {
    if (!audioRef.current) {
      return false;
    }

    if (fallbackAppliedRef.current) {
      return shouldPlay ? playFallbackAudio() : true;
    }

    if (!fallbackAppliedRef.current) {
      fallbackAppliedRef.current = true;
      audioRef.current.src = FALLBACK_SOUND_URL;
    }

    if (shouldPlay) {
      return playFallbackAudio();
    }

    try {
      audioRef.current.load();
      return true;
    } catch (loadErr) {
      console.error('Error loading fallback audio:', loadErr);
      return false;
    }
  }, [playFallbackAudio]);

  useEffect(() => {
    // Reset state when soundUrl changes
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    fallbackAppliedRef.current = false;

    // Create and configure audio element
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    const sanitizedSource = (soundUrl || '').trim();
    audio.src = sanitizedSource || FALLBACK_SOUND_URL;
    audioRef.current = audio;
    
    const handleEnded = () => setIsPlaying(false);
    const handleError = async () => {
      setIsPlaying(false);
      setIsLoading(false);
      try {
        const recovered = await applyFallback(false);
        if (!recovered) {
          handlePlaybackFailure(LOAD_ERROR_MESSAGE);
        }
      } catch (fallbackErr) {
        console.error('Error preparing fallback audio:', fallbackErr);
        handlePlaybackFailure(LOAD_ERROR_MESSAGE);
      }
    };
    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    
    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audioRef.current = null;
    };
  }, [applyFallback, soundUrl]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsLoading(true);
        setError(null);
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error playing audio:', err);
        const recovered = await applyFallback(true);
        if (!recovered) {
          handlePlaybackFailure('Erreur de lecture');
        }
      }
    }
  };

  return (
    <div className="audio-controls">
      <button 
        onClick={togglePlay} 
        className="play-pause-btn"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        disabled={isLoading}
      >
        {isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
      </button>
      {error && (
        <div className="text-xs text-red-600 mt-1">{error}</div>
      )}
    </div>
  );
}

interface MapProps {
  pinpoints: Pinpoint[];
  config: MapConfig;
}

export default function Map({ pinpoints, config }: MapProps) {
  const [mounted, setMounted] = useState(false);
  const uniquePinpoints = useMemo(() => {
    const seen = new Set<string>();
    return pinpoints.filter((pinpoint) => {
      const key = `${pinpoint.title}-${pinpoint.latitude}-${pinpoint.longitude}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [pinpoints]);

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
      {uniquePinpoints.map((pinpoint) => (
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
