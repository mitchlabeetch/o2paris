'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Drop shape SVG
const DropIcon = ({ color = "#00A8E8" }: { color?: string }) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 12 2 12 2C12 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="${color}" fill-opacity="0.9"/>
  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 12 2 12 2C12 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" stroke-width="2"/>
  <path d="M12 6C12 6 15 10 15 13" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
</svg>
`;

const createWaterIcon = () => {
  return L.divIcon({
    className: 'custom-marker-container',
    html: `<div style="width: 40px; height: 40px;">${DropIcon({ color: '#00A8E8' })}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
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
    audio.src = soundUrl || '';
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
        {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <div className="flex-1">
        <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Audio Guide</div>
        {error ? (
           <div className="text-xs text-red-600 flex items-center gap-1">
             <span className="text-lg">⚠️</span> {error}
           </div>
        ) : (
           <div className="h-1 bg-gray-200 rounded-full overflow-hidden w-full">
              <div
                className={`h-full bg-water-main transition-all duration-300 ${isPlaying ? 'opacity-100 animate-pulse' : 'opacity-0'}`}
                style={{ width: '100%' }}
              />
           </div>
        )}
      </div>
    </div>
  );
}

function LocateControl() {
  const map = useMap();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  useEffect(() => {
    map.on('locationfound', (e) => {
      L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'user-location',
          html: `<div style="background-color: #2196F3; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map).bindPopup("Vous êtes ici").openPopup();
    });

    map.on('locationerror', (e) => {
       alert(e.message);
    });
  }, [map]);

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={handleLocate}
          className="bg-white p-2 hover:bg-gray-100 transition-colors w-10 h-10 flex items-center justify-center cursor-pointer border-none"
          title="Me localiser"
          style={{ pointerEvents: 'auto' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="22" y1="12" x2="18" y2="12"></line>
            <line x1="6" y1="12" x2="2" y2="12"></line>
            <line x1="12" y1="6" x2="12" y2="2"></line>
            <line x1="12" y1="22" x2="12" y2="18"></line>
          </svg>
        </button>
      </div>
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
        <div className="text-water-dark text-xl font-serif animate-pulse">Chargement de la carte...</div>
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
          icon={createWaterIcon()}
        >
          <Popup>
            <div className="flex flex-col">
              <div className="bg-water-main h-2 w-full"></div>
              <div className="p-4 popup-scroll max-h-[200px] overflow-y-auto">
                <h3 className="font-serif font-bold text-water-deep text-xl mb-1 leading-tight">
                  {pinpoint.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3 font-sans">
                  {pinpoint.description}
                </p>
                <div className="border-t border-gray-100 pt-2">
                   <AudioPlayer soundUrl={pinpoint.sound_url} />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => {
                       const url = `${window.location.origin}/?id=${pinpoint.id}`;
                       if (navigator.share) {
                         navigator.share({
                           title: pinpoint.title,
                           text: pinpoint.description,
                           url: url
                         }).catch(console.error);
                       } else {
                         navigator.clipboard.writeText(url).then(() => alert('Lien copié !'));
                       }
                    }}
                    className="text-xs text-water-main hover:underline flex items-center gap-1"
                    title="Partager"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Partager
                  </button>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      <LocateControl />
    </MapContainer>
  );
}
