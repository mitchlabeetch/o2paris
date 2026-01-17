/**
 * -----------------------------------------------------------------------------
 * FICHIER : components/Map.tsx
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le composant qui affiche une carte interactive avec des marqueurs.
 * Il permet de cliquer sur des points (pinpoints) pour écouter des sons et
 * lire des descriptions. Il supporte aussi un mode "visite guidée" automatisé.
 *
 * FONCTIONNEMENT :
 * 1. Affiche une carte Leaflet centrée sur Paris.
 * 2. Chaque marqueur représente un "pinpoint" (point d'intérêt avec son).
 * 3. En cliquant sur un marqueur, on ouvre une popup avec audio et description.
 * 4. Mode "tour" : sélectionne automatiquement les points et lit les sons.
 * 5. Gère un registre global de sons en lecture pour "solo" (arrêt des autres).
 *
 * CONNEXIONS :
 * - Reçoit "pinpoints" et "config" comme Props.
 * - Utilise react-leaflet pour l'affichage de la carte.
 * - Intègre le composant "AudioPlayer" pour la gestion des sons.
 *
 * REPÈRES :
 * - Lignes 27-52   : Fonction createWaterIcon (icônes personnalisées).
 * - Lignes 54-77   : Composant LocateControl (bouton de géolocalisation).
 * - Lignes 79-300  : Composant AudioPlayer (lecteur audio avancé).
 * - Lignes 302-331 : Composant TourEffect (gestion du mode visite guidée).
 * - Lignes 338-483 : Composant Map principal.
 * - Lignes 87-88   : Registre global playingAudios (contrôle du "solo").
 * -----------------------------------------------------------------------------
 */

'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import type { Pinpoint, MapConfig } from '@/lib/db';
import { FALLBACK_SOUND_URL } from '@/lib/fallbackAudio';
import Loading from './Loading';

// Fix for default marker icons in react-leaflet
// We manually set the icon URLs to use imported assets (handled by Webpack/Next.js)
// instead of relying on Leaflet's auto-detection or external CDNs.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: iconUrl.src,
  iconRetinaUrl: iconRetinaUrl.src,
  shadowUrl: shadowUrl.src,
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
  
  // Check if it's a custom icon reference
  if (raw.startsWith('custom-icon-')) {
    const iconId = raw.replace('custom-icon-', '');
    return L.divIcon({
      className: 'custom-marker custom-icon-marker',
      html: `<div class="marker-content"><img src="/api/icons?id=${iconId}" alt="icon" style="width: 32px; height: 32px; object-fit: contain;" /></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  }
  
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
  onSkip?: () => void;
  pinpointId?: number;
}

// Global registry to track all playing audio instances
const playingAudios: { [key: number]: { audio: HTMLAudioElement; stop: () => void } } = {};

function AudioPlayer({ soundUrl, autoPlay, onEnded, onSkip, pinpointId }: AudioPlayerProps) {
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
      // Remove from playing audios registry
      if (pinpointId !== undefined) {
        delete playingAudios[pinpointId];
      }
      audioRef.current = null;
    };
  }, [applyFallback, soundUrl, onEnded, pinpointId]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (pinpointId !== undefined) {
        delete playingAudios[pinpointId];
      }
    } else {
      try {
        setIsLoading(true);
        setError(null);
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
        // Register this audio as playing
        if (pinpointId !== undefined && audioRef.current) {
          playingAudios[pinpointId] = { audio: audioRef.current, stop: stopAudio };
        }
      } catch (err) {
        console.error('Error playing audio:', err);
        const recovered = await applyFallback(true);
        if (!recovered) {
          handlePlaybackFailure('Erreur de lecture');
        }
      }
    }
  }, [isPlaying, applyFallback, pinpointId, stopAudio]);

  const handleSoloPlay = useCallback(() => {
    // Stop all other playing sounds except this one
    Object.keys(playingAudios).forEach((idStr) => {
      const id = parseInt(idStr);
      if (id !== pinpointId) {
        playingAudios[id].stop();
      }
    });
  }, [pinpointId]);

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

  // Check if other sounds are playing
  const otherSoundsPlaying = pinpointId !== undefined && 
    Object.keys(playingAudios).some(idStr => parseInt(idStr) !== pinpointId);

  return (
    <div className="audio-controls flex items-center gap-2">
      <button 
        onClick={togglePlay} 
        className="play-pause-btn"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        disabled={isLoading}
      >
        {isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
      </button>
      
      {/* Solo button - only show when other sounds are playing */}
      {isPlaying && otherSoundsPlaying && (
        <button
          onClick={handleSoloPlay}
          className="solo-btn px-2 py-1 text-xs font-semibold bg-water-main text-white rounded hover:bg-water-dark transition-colors"
          title="Couper les autres sons"
        >
          Solo
        </button>
      )}

      {/* Skip button for tour mode */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="skip-btn text-sm px-1.5 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          title="Passer au suivant"
        >
          ⏭
        </button>
      )}
      
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

      {/* Tour Control Buttons */}
      <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '80px', pointerEvents: 'auto' }}>
        <div className="leaflet-control leaflet-bar flex gap-1">
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
          
          {/* Fast-forward button - only show during active tour */}
          {isTourActive && (
            <button
              onClick={handleTourNext}
              className="w-[40px] h-[40px] flex items-center justify-center font-bold text-xl bg-white text-water-dark hover:bg-gray-100 transition-all"
              title="Avancer rapidement (passer au suivant)"
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
              ⏩
            </button>
          )}
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
                <span className="text-2xl flex items-center justify-center w-8 h-8">
                  {pinpoint.icon?.startsWith('custom-icon-') ? (
                    <img 
                      src={`/api/icons?id=${pinpoint.icon.replace('custom-icon-', '')}`}
                      alt="icon"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    pinpoint.icon || '💧'
                  )}
                </span>
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
                  onSkip={isTourActive && tourIndex === idx ? handleTourNext : undefined}
                  pinpointId={pinpoint.id}
                />
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
