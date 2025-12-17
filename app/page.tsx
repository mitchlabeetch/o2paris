import dynamicImport from 'next/dynamic';
import { FALLBACK_MAP_CONFIG, FALLBACK_PINPOINTS, hasValidDatabaseUrl, sql } from '@/lib/db';
import type { Pinpoint, MapConfig } from '@/lib/db';
import Loading from '@/components/Loading';
import WaterCurtain from '@/components/WaterCurtain';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// Dynamically import Map component with no SSR to avoid Leaflet issues
const Map = dynamicImport(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <Loading />,
});

async function getPinpoints(): Promise<Pinpoint[]> {
  try {
    if (!hasValidDatabaseUrl) {
      return FALLBACK_PINPOINTS;
    }

    const pinpoints = await sql`SELECT * FROM pinpoints ORDER BY id`;
    // Normalize DECIMAL strings to numbers
    return (pinpoints as Pinpoint[]).map(p => ({
      ...p,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
    }));
  } catch (error) {
    console.error('Error fetching pinpoints:', error);
    return FALLBACK_PINPOINTS;
  }
}

async function getMapConfig(): Promise<MapConfig> {
  try {
    if (!hasValidDatabaseUrl) {
      return FALLBACK_MAP_CONFIG;
    }

    const configs = await sql`SELECT * FROM map_config ORDER BY id DESC LIMIT 1`;
    
    if (configs.length === 0) {
      // Return default config for Paris
      return FALLBACK_MAP_CONFIG;
    }

    const config = configs[0] as MapConfig;
    // Normalize DECIMAL strings
    return {
      ...config,
      center_lat: Number(config.center_lat),
      center_lng: Number(config.center_lng),
    };
  } catch (error) {
    console.error('Error fetching config:', error);
    // Return default config
    return FALLBACK_MAP_CONFIG;
  }
}

export default async function Home() {
  const pinpoints = await getPinpoints();
  const config = await getMapConfig();

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* Water curtain loading animation */}
      <WaterCurtain />
      
      {/* Map layer with padding - positioned to fill viewport with padding */}
      <div className="absolute inset-0 p-2.5 md:p-10 z-0">
        <Map pinpoints={pinpoints} config={config} />
      </div>
      
      {/* Water-themed header with enhanced styling - Top left, max 30% width */}
      <div className="absolute top-2.5 left-2.5 md:top-10 md:left-10 z-[1000] water-card p-5 rounded-2xl water-texture max-w-[30%] min-w-[200px]">
        <div className="flex items-center gap-3 mb-2">
          <span className="water-droplet text-3xl">💧</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1565C0] to-[#0D47A1] bg-clip-text text-transparent">
            O2Paris
          </h1>
        </div>
        <p className="text-sm text-gray-700 font-medium">Carte Sonore Interactive</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg">🌊</span>
          <p className="text-xs text-[#1565C0] font-semibold tracking-wide uppercase">
            Sons de l&apos;eau à Paris
          </p>
        </div>
      </div>
      
      {/* Admin link with water styling */}
      <a
        href="/admin"
        className="absolute top-2.5 right-2.5 md:top-10 md:right-10 z-[1000] water-card p-3 rounded-full hover:scale-110 transition-all duration-300 group"
        title="Administration"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#1565C0] group-hover:rotate-90 transition-transform duration-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </a>
    </main>
  );
}

