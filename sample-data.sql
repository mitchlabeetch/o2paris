-- Sample Data for O2Paris
-- This file contains example pinpoints for the Paris water map
-- Note: You'll need to upload actual sound files via the admin interface first

-- Example pinpoints around Paris
-- After uploading sounds, update the sound_url values with the correct IDs

INSERT INTO pinpoints (latitude, longitude, title, description, sound_url) VALUES
  (48.8584, 2.2945, 'Tour Eiffel', 'Le son de l''eau qui coule près de la Tour Eiffel', '/api/sounds?id=1'),
  (48.8530, 2.3499, 'Notre-Dame', 'Les sons de la Seine près de Notre-Dame', '/api/sounds?id=2'),
  (48.8620, 2.2876, 'Fontaines du Trocadéro', 'Les majestueuses fontaines du Trocadéro', '/api/sounds?id=3'),
  (48.8462, 2.3371, 'Fontaine Médicis', 'La fontaine paisible du Jardin du Luxembourg', '/api/sounds?id=4'),
  (48.8583, 2.3375, 'Pont des Arts', 'Le bruit de l''eau sous le Pont des Arts', '/api/sounds?id=5');

-- Note: Before running this SQL:
-- 1. Make sure you've initialized the database via /api/init
-- 2. Upload sound files via the admin interface
-- 3. Update the sound_url values with the actual IDs returned

-- To execute this in your Neon console:
-- 1. Log in to your Neon dashboard
-- 2. Go to SQL Editor
-- 3. Paste and execute this SQL
-- 4. Refresh your map to see the new points!
