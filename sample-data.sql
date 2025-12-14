-- Sample Data for O2Paris
-- These points use public domain water ambiance files (hosted on Pixabay).
-- They can be used as-is without uploading audio first.

INSERT INTO pinpoints (latitude, longitude, title, description, sound_url, icon) VALUES
  (48.8566, 2.3522, 'Berges de Seine', 'Ambiance douce le long de la Seine.', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_76b4b38183.mp3?filename=water-nature.wav', '🌊'),
  (48.8720, 2.3650, 'Canal Saint-Martin', 'Le clapotis de l''eau près des écluses.', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_243a828eed.mp3?filename=small-river-in-forest-loop-116199.mp3', '💧'),
  (48.8620, 2.3375, 'Fontaine du Louvre', 'Les fontaines face aux pyramides du Louvre.', 'https://cdn.pixabay.com/download/audio/2023/03/12/audio_b998ccfe80.mp3?filename=fountain-ambient-143925.mp3', '🎵');

-- Before running this SQL:
-- 1. Make sure you've initialized the database via /api/init or scripts/migrations/001_init.sql
-- 2. Adjust titles/descriptions if you need to localize the content
-- 3. Refresh your map to see the new points!

-- To execute this in your Neon console:
-- 1. Log in to your Neon dashboard
-- 2. Go to SQL Editor
-- 3. Paste and execute this SQL
-- 4. Refresh your map to see the new points!
