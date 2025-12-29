require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = neon(connectionString);

const SEED_TILES = [
  {
    title: 'Lumières de Paris',
    description: "Une balade nocturne à travers les rues illuminées de la ville lumière. L'atmosphère est électrique et romantique.",
    sound_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_76b4b38183.mp3?filename=water-nature.wav',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop',
    display_order: 1,
    style_config: JSON.stringify({ font: 'Playfair Display', color: '#ffffff' })
  },
  {
    title: 'Montmartre le matin',
    description: "Le calme avant la tempête touristique, les pavés luisants de rosée et l'odeur du pain frais.",
    sound_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_243a828eed.mp3?filename=small-river-in-forest-loop-116199.mp3',
    image_url: 'https://images.unsplash.com/photo-1550951298-5c7b95a66b6a?q=80&w=2070&auto=format&fit=crop',
    display_order: 2,
    style_config: JSON.stringify({ font: 'Lato', color: '#f0f0f0' })
  },
  {
    title: 'Jardin du Luxembourg',
    description: "Les chaises vertes emblématiques, les voiliers sur le bassin et les enfants qui jouent.",
    sound_url: 'https://cdn.pixabay.com/download/audio/2023/03/12/audio_b998ccfe80.mp3?filename=fountain-ambient-143925.mp3',
    image_url: 'https://images.unsplash.com/photo-1597920364947-0e67272847d0?q=80&w=2070&auto=format&fit=crop',
    display_order: 3,
    style_config: JSON.stringify({ font: 'Playfair Display', color: '#ffffff' })
  },
  {
    title: 'Café de Flore',
    description: "Le brouhaha des conversations intellectuelles, le cliquetis des tasses et l'arôme du café.",
    sound_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_76b4b38183.mp3?filename=water-nature.wav',
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2187&auto=format&fit=crop',
    display_order: 4,
    style_config: JSON.stringify({ font: 'Lato', color: '#ffffff' })
  },
  {
    title: 'Pont Alexandre III',
    description: "Dorures, statues et vue imprenable sur la Tour Eiffel et les Invalides.",
    sound_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_243a828eed.mp3?filename=small-river-in-forest-loop-116199.mp3',
    image_url: 'https://images.unsplash.com/photo-1549144511-f099e7739427?q=80&w=2070&auto=format&fit=crop',
    display_order: 5,
    style_config: JSON.stringify({ font: 'Playfair Display', color: '#ffffff' })
  },
  {
    title: 'Le Marais',
    description: "Ruelles étroites, boutiques branchées et architecture médiévale préservée.",
    sound_url: 'https://cdn.pixabay.com/download/audio/2023/03/12/audio_b998ccfe80.mp3?filename=fountain-ambient-143925.mp3',
    image_url: 'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?q=80&w=2070&auto=format&fit=crop',
    display_order: 6,
    style_config: JSON.stringify({ font: 'Lato', color: '#f0f0f0' })
  },
  {
    title: 'Notre Dame',
    description: "Majestueuse et résiliente, au cœur de l'Île de la Cité.",
    sound_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_76b4b38183.mp3?filename=water-nature.wav',
    image_url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop',
    display_order: 7,
    style_config: JSON.stringify({ font: 'Playfair Display', color: '#ffffff' })
  },
  {
    title: 'Opéra Garnier',
    description: "Opulence, velours rouge et dorures, le temple de la danse et de la musique.",
    sound_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_243a828eed.mp3?filename=small-river-in-forest-loop-116199.mp3',
    image_url: 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=2070&auto=format&fit=crop',
    display_order: 8,
    style_config: JSON.stringify({ font: 'Lato', color: '#ffffff' })
  },
  {
    title: 'Bibliothèque Sainte-Geneviève',
    description: "Le silence studieux et la lumière douce des lampes vertes sur les longues tables.",
    sound_url: 'https://cdn.pixabay.com/download/audio/2023/03/12/audio_b998ccfe80.mp3?filename=fountain-ambient-143925.mp3',
    image_url: 'https://images.unsplash.com/photo-1548705085-101177834f47?q=80&w=2070&auto=format&fit=crop',
    display_order: 9,
    style_config: JSON.stringify({ font: 'Playfair Display', color: '#ffffff' })
  },
  {
    title: 'Metro Parisien',
    description: "Le style Art Nouveau des entrées, le carrelage blanc et le rythme de la ville.",
    sound_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_76b4b38183.mp3?filename=water-nature.wav',
    image_url: 'https://images.unsplash.com/photo-1565012543-057d2949709f?q=80&w=2070&auto=format&fit=crop',
    display_order: 10,
    style_config: JSON.stringify({ font: 'Lato', color: '#f0f0f0' })
  }
];

async function init() {
  console.log("Initializing DB...");

    // Create tiles table (New Photo-based Navigation)
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

    // Create images table for storing image files
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

    // Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_tiles_order ON tiles(display_order)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at)`;

    // Seed sample tiles when empty
    const tilesCount = await sql`SELECT COUNT(*) as count FROM tiles`;
    if (Number(tilesCount[0].count) === 0) {
      console.log("Seeding tiles...");
      for (const tile of SEED_TILES) {
        await sql`
          INSERT INTO tiles (title, description, sound_url, image_url, display_order, style_config)
          VALUES (${tile.title}, ${tile.description}, ${tile.sound_url}, ${tile.image_url}, ${tile.display_order}, ${tile.style_config})
        `;
      }
    } else {
        console.log("Tiles already exist, skipping seed.");
    }

    console.log("Done.");
}

init();
