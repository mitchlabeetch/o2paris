-- Schema + seed for O2Paris (Neon PostgreSQL)
-- Usage: psql "$DATABASE_URL" -f scripts/migrations/001_init.sql

BEGIN;

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
);

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
);

CREATE TABLE IF NOT EXISTS sounds (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  data BYTEA NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pinpoints_location ON pinpoints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_sounds_created ON sounds(created_at);

INSERT INTO map_config (tile_layer_url, center_lat, center_lng, zoom_level, max_zoom, min_zoom, attribution)
SELECT 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 48.8566, 2.3522, 13, 18, 10,
       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
WHERE NOT EXISTS (SELECT 1 FROM map_config);

INSERT INTO pinpoints (latitude, longitude, title, description, sound_url, icon)
SELECT *
FROM (VALUES
  (48.8566, 2.3522, 'Berges de Seine', 'Ambiance douce le long de la Seine.', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_76b4b38183.mp3?filename=water-nature.wav', '🌊'),
  (48.8720, 2.3650, 'Canal Saint-Martin', 'Le clapotis de l’eau près des écluses.', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_243a828eed.mp3?filename=small-river-in-forest-loop-116199.mp3', '💧'),
  (48.8620, 2.3375, 'Fontaine du Louvre', 'Les fontaines face aux pyramides du Louvre.', 'https://cdn.pixabay.com/download/audio/2023/03/12/audio_b998ccfe80.mp3?filename=fountain-ambient-143925.mp3', '🎵')
) AS seed(latitude, longitude, title, description, sound_url, icon)
WHERE NOT EXISTS (SELECT 1 FROM pinpoints);

COMMIT;
