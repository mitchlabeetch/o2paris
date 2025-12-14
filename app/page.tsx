import dynamic from 'next/dynamic';
import { sql } from '@/lib/db';
import type { Pinpoint, MapConfig } from '@/lib/db';

// Dynamically import Map component with no SSR to avoid Leaflet issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-water-light">
      <div className="text-water-dark text-xl">Chargement de la carte...</div>
    </div>
  ),
});

async function getPinpoints(): Promise<Pinpoint[]> {
  try {
    const pinpoints = await sql`SELECT * FROM pinpoints ORDER BY id`;
    return pinpoints as Pinpoint[];
  } catch (error) {
    console.error('Error fetching pinpoints:', error);
    return [];
  }
}

async function getMapConfig(): Promise<MapConfig> {
  try {
    const configs = await sql`SELECT * FROM map_config ORDER BY id DESC LIMIT 1`;
    
    if (configs.length === 0) {
      // Return default config for Paris
      return {
        id: 1,
        tile_layer_url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        center_lat: 48.8566,
        center_lng: 2.3522,
        zoom_level: 13,
        max_zoom: 18,
        min_zoom: 10,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        updated_at: new Date(),
      };
    }

    return configs[0] as MapConfig;
  } catch (error) {
    console.error('Error fetching config:', error);
    // Return default config
    return {
      id: 1,
      tile_layer_url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      center_lat: 48.8566,
      center_lng: 2.3522,
      zoom_level: 13,
      max_zoom: 18,
      min_zoom: 10,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      updated_at: new Date(),
    };
  }
}

export default async function Home() {
  const pinpoints = await getPinpoints();
  const config = await getMapConfig();

  return (
    <main className="relative">
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-water-dark mb-2">O2Paris</h1>
        <p className="text-sm text-gray-700">Carte Sonore Interactive</p>
        <p className="text-xs text-gray-500 mt-1">Eau de Paris</p>
      </div>
      
      <a
        href="/admin"
        className="absolute top-4 right-4 z-[1000] bg-water-dark text-white px-4 py-2 rounded-lg shadow-lg hover:bg-water-deep transition-colors"
      >
        Administration
      </a>
      
      <Map pinpoints={pinpoints} config={config} />
    </main>
  );
}
