import { neon } from '@neondatabase/serverless';

// Get DATABASE_URL from environment
// Use a valid but safe placeholder for build time
const PLACEHOLDER_DB_URL = 'postgresql://user:password@localhost:5432/placeholder';
const DATABASE_URL = process.env.DATABASE_URL || PLACEHOLDER_DB_URL;
const isValidDatabaseUrl = (value: string) =>
  /^postgres(?:ql)?:\/\/\S+$/i.test(value.trim());
export const hasValidDatabaseUrl = Boolean(
  process.env.DATABASE_URL &&
  isValidDatabaseUrl(process.env.DATABASE_URL) &&
  process.env.DATABASE_URL !== PLACEHOLDER_DB_URL
);

// Create SQL client with proper configuration
// fullResults: false returns rows directly (default behavior)
// arrayMode: false returns rows as objects (default behavior)
export const sql = neon(DATABASE_URL, {
  fullResults: false,
  arrayMode: false,
});

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
  background_theme?: string;
}

export interface Sound {
  id: number;
  filename: string;
  mime_type: string;
  size: number;
  created_at: Date;
}

export interface CustomIcon {
  id: number;
  filename: string;
  data: Buffer | Uint8Array;
  mime_type: string;
  size: number;
  created_at: Date;
}

export interface CustomBackground {
  id: number;
  filename: string;
  data: Buffer | Uint8Array;
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
  background_theme: 'water',
};

// Background theme presets with visual previews
export const BACKGROUND_PRESETS = [
  { id: 'water', name: 'Eau', preview: '💧', cssClass: 'bg-gradient-to-br from-water-light via-water-main to-water-deep' },
  { id: 'light', name: 'Clair', preview: '☀️', cssClass: 'bg-gray-100' },
  { id: 'dark', name: 'Sombre', preview: '🌙', cssClass: 'bg-gray-900' },
  { id: 'nature', name: 'Nature', preview: '🌿', cssClass: 'bg-gradient-to-br from-green-100 to-emerald-200' },
  { id: 'sky', name: 'Ciel', preview: '☁️', cssClass: 'bg-gradient-to-br from-blue-100 via-sky-200 to-blue-300' },
  { id: 'sunset', name: 'Coucher de soleil', preview: '🌅', cssClass: 'bg-gradient-to-br from-orange-200 via-pink-300 to-purple-400' },
  { id: 'ocean', name: 'Océan', preview: '🌊', cssClass: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600' },
  { id: 'forest', name: 'Forêt', preview: '🌲', cssClass: 'bg-gradient-to-br from-green-600 via-emerald-700 to-green-900' },
  { id: 'lavender', name: 'Lavande', preview: '🪻', cssClass: 'bg-gradient-to-br from-purple-200 via-violet-300 to-purple-400' },
  { id: 'autumn', name: 'Automne', preview: '🍂', cssClass: 'bg-gradient-to-br from-amber-300 via-orange-400 to-red-500' },
  { id: 'arctic', name: 'Arctique', preview: '❄️', cssClass: 'bg-gradient-to-br from-blue-50 via-cyan-100 to-blue-200' },
  { id: 'desert', name: 'Désert', preview: '🏜️', cssClass: 'bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-400' },
  { id: 'midnight', name: 'Minuit', preview: '🌌', cssClass: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black' },
  { id: 'rose', name: 'Rose', preview: '🌹', cssClass: 'bg-gradient-to-br from-pink-200 via-rose-300 to-pink-400' },
  { id: 'mint', name: 'Menthe', preview: '🍃', cssClass: 'bg-gradient-to-br from-green-100 via-teal-200 to-cyan-300' },
];

// Preset tile layers with visual previews
export const PRESET_TILE_LAYERS = [
  {
    id: 'osm-standard',
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    preview: '🗺️',
    description: 'Carte classique OpenStreetMap'
  },
  {
    id: 'osm-fr',
    name: 'OpenStreetMap France',
    url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap France | © OpenStreetMap contributors',
    preview: '🇫🇷',
    description: 'OpenStreetMap avec style français'
  },
  {
    id: 'osm-hot',
    name: 'OpenStreetMap Humanitarian',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors, Tiles style by HOT',
    preview: '🏥',
    description: 'Style humanitaire axé sur les routes'
  },
  {
    id: 'opentopomap',
    name: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
    preview: '🏔️',
    description: 'Carte topographique avec relief'
  },
  {
    id: 'cyclosm',
    name: 'CyclOSM',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors, CyclOSM',
    preview: '🚲',
    description: 'Carte optimisée pour les cyclistes'
  },
  {
    id: 'carto-light',
    name: 'CartoDB Positron (Clair)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB © OpenStreetMap contributors',
    preview: '☀️',
    description: 'Style moderne et épuré'
  },
  {
    id: 'carto-dark',
    name: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB © OpenStreetMap contributors',
    preview: '🌙',
    description: 'Thème sombre élégant'
  },
  {
    id: 'carto-voyager',
    name: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB © OpenStreetMap contributors',
    preview: '🧭',
    description: 'Style coloré et moderne'
  },
  {
    id: 'carto-light-nolabels',
    name: 'CartoDB Positron (Sans libellés)',
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB © OpenStreetMap contributors',
    preview: '⬜',
    description: 'Fond clair sans texte'
  },
  {
    id: 'esri-street',
    name: 'Esri World Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri',
    preview: '🛣️',
    description: 'Carte routière classique'
  },
  {
    id: 'esri-world-topo',
    name: 'Esri World Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    preview: '⛰️',
    description: 'Carte topographique détaillée'
  },
  {
    id: 'esri-imagery',
    name: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri',
    preview: '🛰️',
    description: 'Imagerie satellite'
  },
  {
    id: 'esri-natgeo',
    name: 'Esri National Geographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri © National Geographic',
    preview: '🌍',
    description: 'Style National Geographic'
  },
  {
    id: 'esri-ocean',
    name: 'Esri Ocean Basemap',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri',
    preview: '🌊',
    description: 'Océans et bathymétrie'
  },
  {
    id: 'esri-relief',
    name: 'Esri World Shaded Relief',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri',
    preview: '🗻',
    description: 'Relief ombré neutre'
  },
  {
    id: 'esri-terrain',
    name: 'Esri World Terrain Base',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri',
    preview: '🏜️',
    description: 'Base de terrain minimaliste'
  }
];

// Water/Paris themed icons organized by category - Expanded to 200+ icons
export const ICON_CATEGORIES = {
  water: {
    label: 'Eau',
    emoji: '💧',
    icons: ['💧', '🌊', '💦', '🚿', '🛁', '🏊', '🏊‍♂️', '🏊‍♀️', '🤿', '🪣', '🌧️', '⛈️', '☔', '🐬', '🐳', '🦈', '🐟', '🐠', '🐡', '🦐', '🦀', '🦞', '🦑', '🐙', '🌀', '❄️', '🧊', '🫧', '🌂', '⛱️', '🏖️', '🏝️', '⛵', '🚤', '🛥️', '⛴️', '🛳️', '🌊']
  },
  paris: {
    label: 'Paris',
    emoji: '🗼',
    icons: ['🗼', '🥖', '🥐', '🧀', '🍷', '☕', '🎭', '🎨', '🏛️', '⚜️', '🚇', '🚲', '🛴', '🎪', '🏰', '🌹', '💐', '🕯️', '🎩', '👗', '💄', '🍾', '🥂', '🎀', '🇫🇷', '🥗', '🍽️', '🎬', '🖼️', '🗿', '🎟️']
  },
  sound: {
    label: 'Sons & Musique',
    emoji: '🎵',
    icons: ['🎵', '🎶', '🎧', '🔊', '📻', '🎤', '🎸', '🎹', '🎺', '🎻', '🥁', '🪘', '🎼', '📯', '🔔', '🔕', '📢', '🗣️', '👂', '🦻', '🎷', '🪗', '🎬', '📀', '💿', '📼', '🔉', '🔈', '📣', '🎙️']
  },
  nature: {
    label: 'Nature',
    emoji: '🌿',
    icons: ['🌳', '🌲', '🌴', '🌿', '🍃', '🌸', '🌺', '🌻', '🌼', '🪻', '🌷', '🪷', '🍀', '☘️', '🌱', '🐦', '🦆', '🦢', '🐸', '🦋', '🌾', '🌵', '🪴', '🏵️', '🥀', '💮', '🐛', '🐝', '🪲', '🐞', '🦗', '🕷️', '🦟', '🐌', '🦎', '🐢', '🐍', '🦕', '🦖', '🐾', '🌏', '🌎', '🌍']
  },
  places: {
    label: 'Lieux',
    emoji: '📍',
    icons: ['📍', '🏠', '🏢', '🏥', '🏦', '🏨', '🏪', '🏫', '⛪', '🕌', '🕍', '⛩️', '🗽', '🎡', '🎢', '⛲', '🌉', '🗺️', '🧭', '🚏', '🏛️', '🏩', '🏬', '🏭', '🏗️', '🏚️', '🏘️', '🏟️', '🎠', '🎭', '🎪', '🗼', '🗻', '🏔️', '⛰️', '🌋', '🏕️', '⛺', '🛤️', '🛣️', '🗾']
  },
  transport: {
    label: 'Transport',
    emoji: '🚗',
    icons: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🛺', '🚲', '🛴', '🚏', '🚇', '🚊', '🚝', '🚞', '🚋', '🚃', '🚟', '🚠', '🚡', '🛶', '⛵', '🚤', '🛥️', '⛴️', '🛳️', '✈️', '🛩️', '🛫', '🛬', '🚁', '🚀', '🛸']
  },
  food: {
    label: 'Nourriture',
    emoji: '🍔',
    icons: ['🍔', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🍝', '🥘', '🍲', '🍜', '🍛', '🍱', '🍣', '🍤', '🥟', '🦪', '🍨', '🍧', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍩', '🍪', '🍿', '🥐', '🥖', '🍞', '🥯', '🧀', '🥚', '🍳', '🥓', '🥞', '🧇', '☕', '🍵', '🧃', '🥤', '🧋', '🍷', '🍾']
  },
  animals: {
    label: 'Animaux',
    emoji: '🐶',
    icons: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈']
  },
  people: {
    label: 'Personnes',
    emoji: '👤',
    icons: ['👤', '👥', '🧑', '👨', '👩', '🧒', '👶', '👴', '👵', '🧓', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️', '👨‍🌾', '👩‍🌾', '👨‍🍳', '👩‍🍳', '👨‍🎨', '👩‍🎨', '👨‍🎤', '👩‍🎤', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🔬', '👩‍🔬', '👨‍✈️', '👩‍✈️', '👮', '🕵️', '💂', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '👼']
  },
  activities: {
    label: 'Activités',
    emoji: '⚽',
    icons: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤸', '🤺', '🤾', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🤹']
  },
  objects: {
    label: 'Objets',
    emoji: '📱',
    icons: ['📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '💾', '💿', '📀', '📷', '📹', '🎥', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳']
  },
  symbols: {
    label: 'Symboles',
    emoji: '⭐',
    icons: ['⭐', '🌟', '✨', '💫', '⚡', '🔥', '💥', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌈', '☔', '💧', '💦', '🌊', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝']
  },
  misc: {
    label: 'Divers',
    emoji: '🎯',
    icons: ['🎯', '🎲', '🎰', '🎳', '🧩', '🧸', '🪅', '🪆', '🎨', '🎬', '🎭', '🎪', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎻', '🎲', '♟️', '🎮', '🕹️', '🎰', '🧿', '🎁', '🎀', '🎈', '🎉', '🎊', '🎏', '🎐', '🎑', '🧧', '🎆', '🎇', '✨', '🎃', '🎄', '🎋', '🎍', '🎎', '🎖️', '🏅', '🏆', '🥇', '🥈', '🥉']
  }
};

// Flat list of all icons for easy access
export const ALL_PRESET_ICONS = Object.values(ICON_CATEGORIES).flatMap(cat => cat.icons);

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
    latitude: 48.8720,
    longitude: 2.3650,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_pinpoint_location_title UNIQUE (latitude, longitude, title)
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        background_theme VARCHAR(50) DEFAULT 'water'
      )
    `;

    // Check if background_theme column exists, add it if not (migration)
    const columns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'map_config' AND column_name = 'background_theme'
    `;

    if (columns.length === 0) {
      await sql`ALTER TABLE map_config ADD COLUMN background_theme VARCHAR(50) DEFAULT 'water'`;
    }

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

    // Create custom_icons table for user-uploaded icons
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

    // Create custom_backgrounds table for user-uploaded backgrounds
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

    // Helpful indexes for location & chronology
    await sql`CREATE INDEX IF NOT EXISTS idx_pinpoints_location ON pinpoints(latitude, longitude)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sounds_created ON sounds(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_custom_icons_created ON custom_icons(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_custom_backgrounds_created ON custom_backgrounds(created_at)`;

    // Insert default map config if not exists
    const configs = await sql`SELECT COUNT(*) as count FROM map_config`;
    if (Number(configs[0].count) === 0) {
      await sql`
        INSERT INTO map_config (tile_layer_url, center_lat, center_lng, zoom_level, max_zoom, min_zoom, attribution, background_theme)
        VALUES (
          ${DEFAULT_MAP_CONFIG.tile_layer_url},
          ${DEFAULT_MAP_CONFIG.center_lat},
          ${DEFAULT_MAP_CONFIG.center_lng},
          ${DEFAULT_MAP_CONFIG.zoom_level},
          ${DEFAULT_MAP_CONFIG.max_zoom},
          ${DEFAULT_MAP_CONFIG.min_zoom},
          ${DEFAULT_MAP_CONFIG.attribution},
          ${DEFAULT_MAP_CONFIG.background_theme}
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
