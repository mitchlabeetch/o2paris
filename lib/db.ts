import { neon } from '@neondatabase/serverless';

// Allow build to succeed without DATABASE_URL (it will be provided at runtime)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost/dbname';

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

// Initialize database tables
export async function initDatabase() {
  try {
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

    // Insert default map config if not exists
    const configs = await sql`SELECT COUNT(*) as count FROM map_config`;
    if (configs[0].count === '0') {
      await sql`
        INSERT INTO map_config (tile_layer_url, center_lat, center_lng, zoom_level, max_zoom, min_zoom, attribution)
        VALUES (
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          48.8566,
          2.3522,
          13,
          18,
          10,
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        )
      `;
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}
