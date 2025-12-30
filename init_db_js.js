require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = neon(connectionString);

const DEFAULT_MAP_CONFIG = {
  tile_layer_url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  center_lat: 48.8566,
  center_lng: 2.3522,
  zoom_level: 13,
  max_zoom: 18,
  min_zoom: 10,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  background_theme: 'water',
  app_title: 'Eau de Paris',
  app_subtitle: 'Une expérience sonore et visuelle',
  overlay_icon: '💧',
  font_family: 'Playfair Display',
  primary_color: '#2196f3',
  secondary_color: '#1565c0',
};

async function init() {
  console.log("Initializing DB schema...");

  try {
    // 1. Create pinpoints table (Legacy support)
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_pinpoint_location_title UNIQUE (latitude, longitude, title)
      )
    `;

    // 2. Create tiles table (New Photo-based Navigation)
    await sql`
      CREATE TABLE IF NOT EXISTS tiles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        sound_url TEXT,
        image_url TEXT,
        display_order INTEGER DEFAULT 0,
        style_config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Create map_config table
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        background_theme VARCHAR(50) DEFAULT 'water',
        app_title VARCHAR(255) DEFAULT 'Eau de Paris',
        app_subtitle VARCHAR(255) DEFAULT 'Une expérience sonore et visuelle',
        overlay_icon VARCHAR(10) DEFAULT '💧',
        font_family VARCHAR(100) DEFAULT 'Playfair Display',
        primary_color VARCHAR(20) DEFAULT '#2196f3',
        secondary_color VARCHAR(20) DEFAULT '#1565c0'
      )
    `;

    // 4. Create sounds table
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

    // 5. Create images table
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        data BYTEA NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 6. Create custom_icons table
    await sql`
      CREATE TABLE IF NOT EXISTS custom_icons (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        data BYTEA NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 7. Create custom_backgrounds table
    await sql`
      CREATE TABLE IF NOT EXISTS custom_backgrounds (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        data BYTEA NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_tiles_order ON tiles(display_order)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sounds_created ON sounds(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_custom_backgrounds_created ON custom_backgrounds(created_at)`;

    // Seed map_config if empty
    const configCount = await sql`SELECT COUNT(*) as count FROM map_config`;
    if (Number(configCount[0].count) === 0) {
      console.log("Seeding default map configuration...");
      await sql`
        INSERT INTO map_config (
          tile_layer_url, center_lat, center_lng, zoom_level, max_zoom, min_zoom, attribution,
          background_theme, app_title, app_subtitle, overlay_icon, font_family, primary_color, secondary_color
        )
        VALUES (
          ${DEFAULT_MAP_CONFIG.tile_layer_url},
          ${DEFAULT_MAP_CONFIG.center_lat},
          ${DEFAULT_MAP_CONFIG.center_lng},
          ${DEFAULT_MAP_CONFIG.zoom_level},
          ${DEFAULT_MAP_CONFIG.max_zoom},
          ${DEFAULT_MAP_CONFIG.min_zoom},
          ${DEFAULT_MAP_CONFIG.attribution},
          ${DEFAULT_MAP_CONFIG.background_theme},
          ${DEFAULT_MAP_CONFIG.app_title},
          ${DEFAULT_MAP_CONFIG.app_subtitle},
          ${DEFAULT_MAP_CONFIG.overlay_icon},
          ${DEFAULT_MAP_CONFIG.font_family},
          ${DEFAULT_MAP_CONFIG.primary_color},
          ${DEFAULT_MAP_CONFIG.secondary_color}
        )
      `;
    }

    // Check for missing columns in map_config (Migration helper)
    const newColumns = ['app_title', 'app_subtitle', 'overlay_icon', 'font_family', 'primary_color', 'secondary_color', 'background_theme'];
    for (const col of newColumns) {
      const colCheck = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'map_config' AND column_name = ${col}
      `;

      if (colCheck.length === 0) {
        console.log(`Migrating: Adding column ${col} to map_config`);
        if (col === 'app_title') await sql`ALTER TABLE map_config ADD COLUMN app_title VARCHAR(255) DEFAULT 'Eau de Paris'`;
        else if (col === 'app_subtitle') await sql`ALTER TABLE map_config ADD COLUMN app_subtitle VARCHAR(255) DEFAULT 'Une expérience sonore et visuelle'`;
        else if (col === 'overlay_icon') await sql`ALTER TABLE map_config ADD COLUMN overlay_icon VARCHAR(10) DEFAULT '💧'`;
        else if (col === 'font_family') await sql`ALTER TABLE map_config ADD COLUMN font_family VARCHAR(100) DEFAULT 'Playfair Display'`;
        else if (col === 'primary_color') await sql`ALTER TABLE map_config ADD COLUMN primary_color VARCHAR(20) DEFAULT '#2196f3'`;
        else if (col === 'secondary_color') await sql`ALTER TABLE map_config ADD COLUMN secondary_color VARCHAR(20) DEFAULT '#1565c0'`;
        else if (col === 'background_theme') await sql`ALTER TABLE map_config ADD COLUMN background_theme VARCHAR(50) DEFAULT 'water'`;
      }
    }

    console.log("Schema initialization complete.");

  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
}

init();
