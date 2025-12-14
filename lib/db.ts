import { neon } from '@neondatabase/serverless';

// Get DATABASE_URL from environment
// Use a valid but safe placeholder for build time
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/placeholder';
export const hasValidDatabaseUrl = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder'));
export const sql = neon(DATABASE_URL);

export interface Pinpoint {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  sound_url: string;
  icon?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MapConfig {
  id: number;
  tile_layer_url: string;
  center_lat: number;
  center_lng: number;
  zoom_level: number;
  max_zoom: number;
  min_zoom: number;
  attribution: string;
  updated_at: Date;
}

export interface Sound {
  id: number;
  filename: string;
  mime_type: string;
  size: number;
  created_at: Date;
}

export const DEFAULT_MAP_CONFIG: Omit<MapConfig, 'id' | 'updated_at'> = {
  tile_layer_url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  center_lat: 48.8566,
  center_lng: 2.3522,
  zoom_level: 13,
  max_zoom: 18,
  min_zoom: 10,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export const SEED_PINPOINTS: Omit<Pinpoint, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    latitude: 48.8566,
    longitude: 2.3522,
    title: 'Berges de Seine',
    description: 'Ambiance douce le long de la Seine.',
    sound_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_76b4b38183.mp3?filename=water-nature.wav',
    icon: '🌊',
  },
  {
    latitude: 48.872,
    longitude: 2.365,
    title: 'Canal Saint-Martin',
    description: 'Le clapotis de l’eau près des écluses.',
    sound_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_243a828eed.mp3?filename=small-river-in-forest-loop-116199.mp3',
    icon: '💧',
  },
  {
    latitude: 48.862,
    longitude: 2.3375,
    title: 'Fontaine du Louvre',
    description: 'Les fontaines face aux pyramides du Louvre.',
    sound_url: 'https://cdn.pixabay.com/download/audio/2023/03/12/audio_b998ccfe80.mp3?filename=fountain-ambient-143925.mp3',
    icon: '🎵',
  },
];

export const FALLBACK_PINPOINTS: Pinpoint[] = SEED_PINPOINTS.map((pinpoint, index) => ({
  ...pinpoint,
  id: index + 1,
  created_at: new Date(),
  updated_at: new Date(),
}));

export const FALLBACK_MAP_CONFIG: MapConfig = {
  id: 1,
  updated_at: new Date(),
  ...DEFAULT_MAP_CONFIG,
};

// Initialize database tables
export async function initDatabase() {
  try {
    if (!hasValidDatabaseUrl) {
      throw new Error('DATABASE_URL is not configured. Set it before initializing the database.');
    }

    // Create pinpoints table
    await sql`
      CREATE TABLE IF NOT EXISTS pinpoints (
        id SERIAL PRIMARY KEY,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        sound_url TEXT NOT NULL,
        icon VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create map_config table
    await sql`
      CREATE TABLE IF NOT EXISTS map_config (
        id SERIAL PRIMARY KEY,
        tile_layer_url TEXT NOT NULL,
        center_lat DECIMAL(10, 8) NOT NULL,
        center_lng DECIMAL(11, 8) NOT NULL,
        zoom_level INTEGER DEFAULT 13,
        max_zoom INTEGER DEFAULT 18,
        min_zoom INTEGER DEFAULT 10,
        attribution TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create sounds table for storing audio files
    await sql`
      CREATE TABLE IF NOT EXISTS sounds (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        data BYTEA NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Helpful indexes for location & chronology
    await sql`CREATE INDEX IF NOT EXISTS idx_pinpoints_location ON pinpoints(latitude, longitude)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sounds_created ON sounds(created_at)`;

    // Insert default map config if not exists
    const configs = await sql`SELECT COUNT(*) as count FROM map_config`;
    if (Number(configs[0].count) === 0) {
      await sql`
        INSERT INTO map_config (tile_layer_url, center_lat, center_lng, zoom_level, max_zoom, min_zoom, attribution)
        VALUES (
          ${DEFAULT_MAP_CONFIG.tile_layer_url},
          ${DEFAULT_MAP_CONFIG.center_lat},
          ${DEFAULT_MAP_CONFIG.center_lng},
          ${DEFAULT_MAP_CONFIG.zoom_level},
          ${DEFAULT_MAP_CONFIG.max_zoom},
          ${DEFAULT_MAP_CONFIG.min_zoom},
          ${DEFAULT_MAP_CONFIG.attribution}
        )
      `;
    }

    // Seed sample pinpoints when empty
    const pinpointsCount = await sql`SELECT COUNT(*) as count FROM pinpoints`;
    if (Number(pinpointsCount[0].count) === 0) {
      for (const point of SEED_PINPOINTS) {
        await sql`
          INSERT INTO pinpoints (latitude, longitude, title, description, sound_url, icon)
          VALUES (${point.latitude}, ${point.longitude}, ${point.title}, ${point.description}, ${point.sound_url}, ${point.icon})
        `;
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}
