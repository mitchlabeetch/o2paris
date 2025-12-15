import { FALLBACK_MAP_CONFIG, FALLBACK_PINPOINTS, hasValidDatabaseUrl, sql } from '@/lib/db';
import type { Pinpoint, MapConfig } from '@/lib/db';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

async function getPinpoints(): Promise<Pinpoint[]> {
  try {
    if (!hasValidDatabaseUrl) {
      return FALLBACK_PINPOINTS;
    }

    const pinpoints = await sql`SELECT * FROM pinpoints ORDER BY id`;
    return pinpoints as Pinpoint[];
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

    return configs[0] as MapConfig;
  } catch (error) {
    console.error('Error fetching config:', error);
    // Return default config
    return FALLBACK_MAP_CONFIG;
  }
}

export default async function Home() {
  const pinpoints = await getPinpoints();
  const config = await getMapConfig();

  return <HomeClient initialPinpoints={pinpoints} config={config} />;
}
