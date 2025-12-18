'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import type { Pinpoint, MapConfig } from '@/lib/db';
import { FALLBACK_SOUND_URL } from '@/lib/fallbackAudio';
import Loading from './Loading';

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
  const emojiSafePattern = /^(?:[A-Za-z0-9]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83E[\uDD00-\uDDFF]){1,4}$/;
  const safe = emojiSafePattern.test(raw) ? raw : '💧';
  const symbol = escapeHtml(safe);
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-content">${symbol}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

function LocateControl() {
  const map = useMap();

  const handleLocate = () => {
    map.locate().on("locationfound", function (e) {
      map.flyTo(e.latlng, map.getZoom());
    });
  };

  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={handleLocate}
          className="bg-white hover:bg-gray-100 text-water-dark w-[30px] h-[30px] flex items-center justify-center font-bold text-lg"
          title="Me localiser"
          style={{ width: '30px', height: '30px', lineHeight: '30px', cursor: 'pointer', border: 'none', background: 'white' }}
        >
          📍
        </button>
      </div>
    </div>
  );
}

interface AudioPlayerProps {
  soundUrl: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

function AudioPlayer({ soundUrl, autoPlay, onEnded }: AudioPlayerProps) {
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
    audio.src = soundUrl || '';
    audioRef.current = audio;
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

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
  }, [applyFallback, soundUrl, onEnded]);

  const togglePlay = useCallback(async () => {
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
  }, [isPlaying, applyFallback]);

  // Handle autoPlay
  useEffect(() => {
    if (autoPlay && !isPlaying && !isLoading && !error && audioRef.current) {
      // Use a small timeout to ensure everything is ready and avoid race conditions
      const timer = setTimeout(() => {
        togglePlay();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, isPlaying, isLoading, error, togglePlay]);

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

// Effect component to handle map movement during tour
function TourEffect({
  activePinpoint,
  markerRefs
}: {
  activePinpoint: Pinpoint | null,
  markerRefs: React.MutableRefObject<{[key: number]: L.Marker | null}>
}) {
  const map = useMap();

  useEffect(() => {
    if (activePinpoint) {
      map.flyTo([activePinpoint.latitude, activePinpoint.longitude], 16, {
        duration: 1.5
      });
      // Allow time for fly animation to start before opening popup
      const timer = setTimeout(() => {
        const marker = markerRefs.current[activePinpoint.id];
        if (marker) {
          marker.openPopup();
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      map.closePopup();
    }
  }, [activePinpoint, map, markerRefs]);

  return null;
}

interface MapProps {
  pinpoints: Pinpoint[];
  config: MapConfig;
}

export default function Map({ pinpoints, config }: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [tourIndex, setTourIndex] = useState<number>(-1);
  const markerRefs = useRef<{[key: number]: L.Marker | null}>({});

  const isTourActive = tourIndex >= 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartTour = () => {
    if (pinpoints.length > 0) {
      setTourIndex(0);
    }
  };

  const handleStopTour = () => {
    setTourIndex(-1);
  };

  const handleTourNext = useCallback(() => {
    if (tourIndex < pinpoints.length - 1) {
      setTourIndex(prev => prev + 1);
    } else {
      setTourIndex(-1); // End tour
    }
  }, [tourIndex, pinpoints.length]);

  if (!mounted) {
    return <Loading />;
  }

  return (
    <MapContainer
      center={[config.center_lat, config.center_lng]}
      zoom={config.zoom_level}
      style={{ height: '100%', width: '100%' }}
      maxZoom={config.max_zoom}
      minZoom={config.min_zoom}
      zoomControl={false}
    >
      <TileLayer
        attribution={config.attribution}
        url={config.tile_layer_url}
      />
      <ZoomControl position="bottomright" />
      <LocateControl />

      <TourEffect
        activePinpoint={isTourActive ? pinpoints[tourIndex] : null}
        markerRefs={markerRefs}
      />

      {/* Tour Control Button */}
      <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '80px', pointerEvents: 'auto' }}>
        <div className="leaflet-control leaflet-bar">
          <button
            onClick={isTourActive ? handleStopTour : handleStartTour}
            className={`w-[40px] h-[40px] flex items-center justify-center font-bold text-xl transition-all ${
              isTourActive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-water-dark hover:bg-gray-100'
            }`}
            title={isTourActive ? "Arrêter la visite" : "Démarrer la visite guidée"}
            style={{
              width: '40px',
              height: '40px',
              lineHeight: '40px',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '4px',
              boxShadow: '0 1px 5px rgba(0,0,0,0.4)'
            }}
          >
            {isTourActive ? '⏹' : '▶️'}
          </button>
        </div>
      </div>

      {pinpoints.map((pinpoint, idx) => (
        <Marker
          key={pinpoint.id}
          position={[pinpoint.latitude, pinpoint.longitude]}
          icon={createWaterIcon(pinpoint.icon)}
          ref={(ref) => {
             // Type assertion for ref if needed, or simply assign
             if (ref) markerRefs.current[pinpoint.id] = ref;
          }}
        >
          <Popup className="custom-popup">
            <div className="p-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                <span className="text-2xl">{pinpoint.icon || '💧'}</span>
                <h3 className="font-bold text-water-dark text-lg leading-tight">
                  {pinpoint.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {pinpoint.description}
              </p>
              <div className="bg-gray-50 p-2 rounded-lg">
                <AudioPlayer
                  soundUrl={pinpoint.sound_url}
                  autoPlay={isTourActive && tourIndex === idx}
                  onEnded={isTourActive ? handleTourNext : undefined}
                />
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
