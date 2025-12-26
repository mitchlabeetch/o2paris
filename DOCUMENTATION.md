# 📖 O2Paris - Complete Documentation

> **⚠️ Language Notice**: This application's content and interface are in **French** (Français). The documentation below is in English, but the actual app UI, descriptions, and audio content are in French as it was developed for Eau de Paris (Paris Water Authority).

> **🎯 Project Notice**: O2Paris is a **project-specific application** developed for Eau de Paris. However, we welcome and encourage you to adapt it for your own custom projects! The architecture is flexible and can be adapted to create interactive sound maps for any city, location, or theme.

---

## 🌊 Welcome to O2Paris!

**O2Paris** is an interactive sound map application that brings the city of Paris to life through audio experiences. Built in collaboration with Eau de Paris (Paris Water Authority), this application creates an immersive exploration of Paris through geolocated sound points on an interactive map.

Think of it as a virtual audio tour where each point on the map tells a story through sound – the flowing fountains, the Seine river, the water networks that make Paris thrive.

### What Makes O2Paris Special?

- 🗺️ **Interactive Leaflet.js Map**: Beautiful, responsive map of Paris
- 🔊 **Sound Points**: Click markers to hear location-specific audio
- 🎨 **Water Theme**: Beautiful aquatic design palette inspired by water
- 🛠️ **Admin Panel**: Powerful GUI to manage content without coding
- 📱 **Responsive**: Works on desktop, tablet, and mobile
- ⚡ **Serverless**: Deployed on Vercel with automatic scaling
- 🔒 **Secure**: Password-protected admin with encrypted credentials

---

## 📚 Table of Contents

1. [Quick Overview](#-quick-overview)
2. [Features in Detail](#-features-in-detail)
3. [Installation Guide](#-installation-guide)
4. [Configuration](#-configuration)
5. [Using O2Paris](#-using-o2paris)
6. [Admin Panel Guide](#-admin-panel-guide)
7. [Deployment](#-deployment)
8. [API Reference](#-api-reference)
9. [Architecture](#-architecture)
10. [Customization for Your Project](#-customization-for-your-project)
11. [Troubleshooting](#-troubleshooting)
12. [Contributing](#-contributing)
13. [License & Credits](#-license--credits)

---

## 🎯 Quick Overview

### What Does O2Paris Do?

O2Paris displays an interactive map of Paris with clickable sound points. When visitors click a marker:
1. A popup appears with a title and description (in French)
2. An embedded audio player allows them to play/pause a sound
3. The sound is streamed from a PostgreSQL database

### Who Is It For?

- **Primary**: Eau de Paris project for water-themed audio experiences
- **Secondary**: Anyone wanting to create interactive sound maps for cities, tours, museums, etc.

### Tech Stack at a Glance

- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **Map**: Leaflet.js with React-Leaflet
- **Backend**: Next.js API Routes (serverless)
- **Database**: Neon PostgreSQL (serverless)
- **Hosting**: Vercel
- **Audio**: Streamed as binary data (BYTEA) from PostgreSQL

---

## ✨ Features in Detail

### 1. Interactive Map Display

The main page (`/`) displays an interactive map powered by Leaflet.js:

- **Default View**: Centers on Paris (48.8566° N, 2.3522° E)
- **Custom Markers**: Water droplet icons in blue
- **Zoom Controls**: Min/max zoom configurable
- **Tile Layers**: Customizable map tiles (default: OpenStreetMap)
- **Responsive**: Adapts to screen size

### 2. Sound Points (Pinpoints)

Each marker on the map represents a sound point with:

- **Geolocation**: Precise latitude/longitude coordinates
- **Title**: Brief name of the location (e.g., "Fontaine des Innocents")
- **Description**: Rich text description of the place and sound
- **Audio Player**: Embedded play/pause controls
- **Custom Icons**: Configurable per point (future feature)

### 3. Audio Streaming

- **Storage**: Audio files stored as binary data in PostgreSQL
- **Formats**: Supports MP3, WAV, OGG, and other web-compatible formats
- **Streaming**: Files streamed via `/api/sounds?id=X` endpoint
- **Caching**: 24-hour browser cache for optimal performance
- **Fallback**: Beep sound if audio fails to load

### 4. Admin Panel

Password-protected interface at `/admin` with three main tabs:

#### Points Management Tab
- View all points in a table
- Create new points with form
- Edit existing points inline
- Delete points with confirmation
- Real-time map preview

#### Sounds Management Tab
- Upload audio files (drag & drop or click)
- View all uploaded sounds with details
- Delete unused sounds
- Copy sound URLs for use in points

#### Map Configuration Tab
- Set map center (latitude/longitude)
- Configure zoom levels (initial, min, max)
- Customize tile layer URL
- Update map attribution text
- Preview changes before saving

### 5. Theme and Design

Cohesive water-inspired design throughout:

- **Colors**:
  - `water-light`: #E3F2FD (pale blue)
  - `water`: #2196F3 (primary blue)
  - `water-dark`: #1565C0 (deep blue)
  - `water-deep`: #0D47A1 (navy)
- **Gradients**: Blue gradients for buttons and headers
- **Icons**: Water droplet markers
- **Typography**: Clean, readable fonts
- **Animations**: Smooth transitions and loading states

---

## 🚀 Installation Guide

### Prerequisites

Before you begin, make sure you have:

- **Node.js**: Version 18 or higher ([download here](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Git**: For cloning the repository
- **Neon Account**: Free PostgreSQL database ([sign up here](https://neon.tech))
- **Vercel Account** (optional): For deployment ([sign up here](https://vercel.com))

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
# Clone the original repository
git clone https://github.com/mitchlabeetch/o2paris.git
cd o2paris

# Or if you forked it, clone your fork:
# git clone https://github.com/YOUR_USERNAME/o2paris.git
# cd o2paris
```

#### 2. Install Dependencies

```bash
npm install
```

This installs all required packages:
- Next.js 14
- React 18
- Leaflet & React-Leaflet
- Neon PostgreSQL client
- Tailwind CSS
- TypeScript

#### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Database connection string from Neon
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Admin password (use strong password for production)
ADMIN_PASSWORD="Admin123"

# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-here"
```

**Important Security Notes**:
- Never commit `.env` to version control
- Use a strong password for `ADMIN_PASSWORD` in production
- Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`

#### 4. Initialize the Database

You have two options:

**Option A: Via API (Recommended for Beginners)**

1. Start the development server (see step 5)
2. Visit `http://localhost:3000/api/init` in your browser
3. You should see: `{"message":"Database initialized successfully","success":true}`
4. This creates all tables AND inserts sample data

**Option B: Via SQL Script**

```bash
psql "$DATABASE_URL" -f scripts/migrations/001_init.sql
```

This creates tables only. Add sample data manually via admin panel.

#### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Paris map with any sample points you created!

#### 6. Access Admin Panel

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Enter password: `Admin123` (default for development)
3. Start adding your sound points!

---

## ⚙️ Configuration

### Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string from Neon | `postgresql://user:pass@host.neon.tech/db` |
| `ADMIN_PASSWORD` | Password for admin panel | `MyStr0ng!P@ssw0rd2024` |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | Secret for session encryption | Auto-generated in dev |

### Map Configuration

Default map settings (configurable via admin panel):

```javascript
{
  center: [48.8566, 2.3522], // Paris coordinates
  zoom: 13,                   // Initial zoom level
  minZoom: 11,                // Minimum zoom out
  maxZoom: 18,                // Maximum zoom in
  tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© OpenStreetMap contributors"
}
```

### Database Tables

The app creates three main tables:

#### `pinpoints` Table
```sql
id          SERIAL PRIMARY KEY
latitude    DECIMAL(10, 8)      -- Point location
longitude   DECIMAL(11, 8)      -- Point location
title       VARCHAR(255)        -- Display name
description TEXT                -- Rich description
sound_url   TEXT                -- Link to audio
icon        VARCHAR(255)        -- Custom icon (optional)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

#### `sounds` Table
```sql
id          SERIAL PRIMARY KEY
filename    VARCHAR(255)        -- Original filename
data        BYTEA               -- Binary audio data
mime_type   VARCHAR(100)        -- e.g., "audio/mpeg"
size        INTEGER             -- File size in bytes
created_at  TIMESTAMP
```

#### `map_config` Table
```sql
id              SERIAL PRIMARY KEY
tile_layer_url  TEXT               -- Map tiles URL
center_lat      DECIMAL(10, 8)     -- Map center
center_lng      DECIMAL(11, 8)     -- Map center
zoom_level      INTEGER            -- Initial zoom
max_zoom        INTEGER            -- Max zoom
min_zoom        INTEGER            -- Min zoom
attribution     TEXT               -- Map attribution
updated_at      TIMESTAMP
```

---

## 💡 Using O2Paris

### For Visitors (Public Interface)

1. **View the Map**: Visit the homepage to see the interactive map
2. **Explore Points**: Pan and zoom to discover sound points
3. **Click Markers**: Click any blue droplet marker
4. **Read Description**: A popup appears with title and description (in French)
5. **Listen to Audio**: Click the play button to hear the sound
6. **Continue Exploring**: Close popup and click another marker

**Tips for Visitors**:
- Use zoom controls (+ / -) to explore different areas
- Click outside popup to close it
- Multiple sounds can be played sequentially
- Works best on modern browsers (Chrome, Firefox, Safari, Edge)

### For Administrators

See the [Admin Panel Guide](#-admin-panel-guide) section below for detailed instructions.

---

## 🛠️ Admin Panel Guide

Access the admin panel at `/admin` with your password.

### Logging In

1. Navigate to `http://your-domain.com/admin`
2. Enter your `ADMIN_PASSWORD`
3. Click "Se connecter" (Login)
4. Session lasts until you close browser or logout

### Managing Sound Points

#### Creating a New Point

1. Click **"Points sur la carte"** tab
2. Scroll to **"Ajouter un nouveau point"** section
3. Fill in the form:
   - **Latitude**: Decimal degrees (e.g., `48.8584`)
   - **Longitude**: Decimal degrees (e.g., `2.2945`)
   - **Titre**: Short name (e.g., "Tour Eiffel")
   - **Description**: Rich description in French
   - **URL du son**: `/api/sounds?id=X` (X = sound ID)
4. Click **"Ajouter le point"**
5. Point appears immediately on the map!

**Finding Coordinates**:
- Use [Google Maps](https://maps.google.com): Right-click → Copy coordinates
- Use [OpenStreetMap](https://openstreetmap.org): Click location → URL shows lat/long
- Format: `latitude, longitude` (e.g., `48.8584, 2.2945`)

#### Editing a Point

1. Find the point in the list
2. Click **"Modifier"** button
3. Update any fields
4. Click **"Sauvegarder"** to save changes

#### Deleting a Point

1. Find the point in the list
2. Click **"Supprimer"** button
3. Confirm the deletion
4. Point is removed from database and map

### Managing Sounds

#### Uploading Audio

1. Click **"Sons"** tab
2. Click **"Choisir un fichier"** or drag & drop
3. Select audio file (MP3, WAV, OGG, etc.)
4. Click **"Upload"**
5. Success message shows the sound ID
6. Copy the ID for use in points: `/api/sounds?id=X`

**Audio Recommendations**:
- **Format**: MP3 (best compatibility)
- **Bitrate**: 128-192 kbps (good quality, reasonable size)
- **Duration**: 30-90 seconds (ideal for listening)
- **Size**: Under 5MB per file (faster loading)
- **Sample Rate**: 44.1 kHz (standard)

**Where to Find Sounds**:
- [Freesound.org](https://freesound.org) - Free Creative Commons sounds
- [Zapsplat.com](https://zapsplat.com) - Free sound effects
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/) - Free archive
- Record your own with smartphone!

#### Viewing Sounds

The sounds list shows:
- **ID**: Use in `/api/sounds?id=X`
- **Filename**: Original file name
- **Size**: File size in KB/MB
- **Type**: MIME type (e.g., audio/mpeg)
- **Created**: Upload timestamp
- **Actions**: Delete button

#### Deleting Sounds

1. Find sound in list
2. Click **"Supprimer"**
3. Confirm deletion
4. **Warning**: Make sure no points reference this sound!

### Configuring the Map

1. Click **"Configuration de la carte"** tab
2. Update any settings:
   - **Centre (latitude)**: Map center Y coordinate
   - **Centre (longitude)**: Map center X coordinate
   - **Niveau de zoom**: Initial zoom (1-20)
   - **Zoom max**: Maximum zoom in level
   - **Zoom min**: Minimum zoom out level
   - **URL de tuiles**: Map tile server
   - **Attribution**: Copyright text for tiles
3. Click **"Sauvegarder la configuration"**
4. Refresh main page to see changes

**Popular Tile Providers**:

| Provider | URL Template | Attribution |
|----------|--------------|-------------|
| OpenStreetMap | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | `© OpenStreetMap contributors` |
| CartoDB Light | `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png` | `© CartoDB` |
| Stamen Terrain | `https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg` | `© Stamen Design` |

### Logging Out

Click **"Se déconnecter"** (Logout) in the top-right corner.

---

## 🚢 Deployment

### Deploying to Vercel (Recommended)

Vercel is the easiest way to deploy O2Paris as it's optimized for Next.js.

#### Method 1: Via Vercel Dashboard (Easiest)

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up
2. **Import Project**: Click "Add New" → "Project"
3. **Connect GitHub**: Authorize Vercel to access your repos
4. **Select Repository**: Choose `mitchlabeetch/o2paris` or your fork
5. **Configure Environment Variables**:
   - Click "Environment Variables"
   - Add `DATABASE_URL` (your Neon connection string)
   - Add `ADMIN_PASSWORD` (strong password for production!)
6. **Deploy**: Click "Deploy"
7. **Wait**: Build takes 30-60 seconds
8. **Success**: You'll get a URL like `o2paris.vercel.app`

#### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts to set environment variables
```

#### Post-Deployment Steps

1. **Initialize Database**: Visit `https://your-app.vercel.app/api/init`
2. **Verify Response**: Should see `{"message":"Database initialized successfully"}`
3. **Login to Admin**: Go to `https://your-app.vercel.app/admin`
4. **Add Content**: Start adding your sound points!

**🔒 Production Security Checklist**:
- [ ] Used strong `ADMIN_PASSWORD` (12+ characters, mixed case, numbers, symbols)
- [ ] `DATABASE_URL` has `?sslmode=require` at the end
- [ ] Environment variables set in Vercel (not in code)
- [ ] `.env` file is in `.gitignore`
- [ ] Tested login with new password
- [ ] Changed password from default `Admin123`

### Alternative Hosting Options

#### Deploy to Netlify

1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy!

#### Deploy to Your Own Server

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "o2paris" -- start
```

---

## 📡 API Reference

All API routes are serverless functions in `app/api/`.

### Pinpoints API

#### Get All Pinpoints
```http
GET /api/pinpoints
```

**Response**:
```json
[
  {
    "id": 1,
    "latitude": 48.8584,
    "longitude": 2.2945,
    "title": "Tour Eiffel",
    "description": "Description in French...",
    "sound_url": "/api/sounds?id=1",
    "icon": null,
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
]
```

#### Create Pinpoint
```http
POST /api/pinpoints
Content-Type: application/json

{
  "latitude": 48.8584,
  "longitude": 2.2945,
  "title": "Tour Eiffel",
  "description": "Description...",
  "sound_url": "/api/sounds?id=1"
}
```

**Response**: `201 Created`

#### Update Pinpoint
```http
PUT /api/pinpoints
Content-Type: application/json

{
  "id": 1,
  "latitude": 48.8584,
  "longitude": 2.2945,
  "title": "Updated Title",
  "description": "Updated description...",
  "sound_url": "/api/sounds?id=1"
}
```

**Response**: `200 OK`

#### Delete Pinpoint
```http
DELETE /api/pinpoints?id=1
```

**Response**: `200 OK`

### Sounds API

#### Get Sound by ID
```http
GET /api/sounds?id=1
```

**Response**: Binary audio stream with headers:
```
Content-Type: audio/mpeg
Cache-Control: public, max-age=86400, immutable
```

#### List All Sounds
```http
GET /api/sounds
```

**Response**:
```json
[
  {
    "id": 1,
    "filename": "fountain.mp3",
    "size": 1234567,
    "mime_type": "audio/mpeg",
    "created_at": "2024-01-01T12:00:00Z"
  }
]
```

#### Upload Sound
```http
POST /api/sounds
Content-Type: multipart/form-data

file: [binary audio file]
```

**Response**:
```json
{
  "id": 1,
  "message": "Sound uploaded successfully"
}
```

#### Delete Sound
```http
DELETE /api/sounds?id=1
```

**Response**: `200 OK`

### Config API

#### Get Map Configuration
```http
GET /api/config
```

**Response**:
```json
{
  "id": 1,
  "tile_layer_url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "center_lat": 48.8566,
  "center_lng": 2.3522,
  "zoom_level": 13,
  "max_zoom": 18,
  "min_zoom": 11,
  "attribution": "© OpenStreetMap contributors",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

#### Update Map Configuration
```http
PUT /api/config
Content-Type: application/json

{
  "tile_layer_url": "https://...",
  "center_lat": 48.8566,
  "center_lng": 2.3522,
  "zoom_level": 13,
  "max_zoom": 18,
  "min_zoom": 11,
  "attribution": "© OpenStreetMap"
}
```

**Response**: `200 OK`

### Auth API

#### Login
```http
POST /api/auth
Content-Type: application/json

{
  "password": "Admin123"
}
```

**Response**: `200 OK` + Sets `admin_token` cookie

#### Logout
```http
DELETE /api/auth
```

**Response**: `200 OK` + Clears `admin_token` cookie

### Init API

#### Initialize Database
```http
GET /api/init
```

**Response**:
```json
{
  "message": "Database initialized successfully",
  "success": true
}
```

Creates all tables and inserts sample data.

---

## 🏗️ Architecture

### Tech Stack Overview

```
Frontend (Browser)
    ↓
Next.js 14 (React + TypeScript)
    ↓
API Routes (Serverless Functions)
    ↓
Neon PostgreSQL (Serverless Database)
```

### Directory Structure

```
o2paris/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (serverless)
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── config/               # Map configuration
│   │   ├── init/                 # Database initialization
│   │   ├── pinpoints/            # Points CRUD
│   │   └── sounds/               # Audio upload/stream
│   ├── admin/                    # Admin panel page
│   │   └── page.tsx
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (map)
├── components/                   # React components
│   ├── Map.tsx                   # Leaflet map component
│   ├── Loading.tsx               # Loading spinner
│   └── WaterCurtain.tsx          # Animated background
├── lib/                          # Utilities
│   ├── db.ts                     # Database config & schemas
│   └── auth.ts                   # Authentication logic
├── public/                       # Static assets
├── scripts/                      # Database migrations
│   └── migrations/
│       └── 001_init.sql
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
└── vercel.json                   # Vercel settings
```

### Key Components

#### Frontend Components

- **`app/page.tsx`**: Main page, server-rendered, fetches data
- **`components/Map.tsx`**: Client-side Leaflet map with markers
- **`app/admin/page.tsx`**: Full admin interface with tabs
- **`components/Loading.tsx`**: Loading spinner for map
- **`components/WaterCurtain.tsx`**: Animated water background

#### Backend Logic

- **`lib/db.ts`**: Database connection, schemas, fallbacks
- **`lib/auth.ts`**: Password verification
- **API Routes**: All endpoints as serverless functions

### Data Flow

```
1. User visits homepage
    ↓
2. Next.js SSR fetches pinpoints & config from DB
    ↓
3. HTML sent to browser with data
    ↓
4. React hydrates, loads Map component
    ↓
5. Leaflet displays markers
    ↓
6. User clicks marker
    ↓
7. Popup opens with audio player
    ↓
8. Audio streams from /api/sounds?id=X
    ↓
9. Browser plays sound
```

### Security Model

- **Authentication**: Simple password comparison
- **Sessions**: HTTP-only cookies with random tokens
- **Secrets**: Stored in environment variables (encrypted on Vercel)
- **Database**: SSL required for connections
- **API**: No public write access without auth

---

## 🎨 Customization for Your Project

O2Paris is designed to be adaptable! Here's how to customize it for your own use case.

### Use Case Ideas

- **City Audio Tours**: Create audio guides for any city
- **Museum Exhibits**: Interactive audio exhibits on a floor plan
- **Nature Trails**: Sounds of wildlife along hiking paths
- **Historical Sites**: Stories at historical locations
- **Art Installations**: Interactive sound art in galleries
- **Educational**: Language learning with location-based audio
- **Storytelling**: Audio stories at specific locations

### Customization Steps

#### 1. Change the Theme

Edit `tailwind.config.ts` to change colors:

```typescript
theme: {
  extend: {
    colors: {
      // Change from water theme to your theme
      primary: {
        light: '#YOUR_COLOR',
        DEFAULT: '#YOUR_COLOR',
        dark: '#YOUR_COLOR',
        deep: '#YOUR_COLOR',
      },
    },
  },
}
```

Then update component references from `water` to `primary`.

#### 2. Change Default Location

Edit `lib/db.ts`:

```typescript
export const FALLBACK_MAP_CONFIG: MapConfig = {
  center_lat: YOUR_LATITUDE,      // e.g., 40.7128 for NYC
  center_lng: YOUR_LONGITUDE,     // e.g., -74.0060 for NYC
  zoom_level: 13,
  // ... other settings
};
```

#### 3. Customize Markers

Replace marker icons in `components/Map.tsx`:

```typescript
const icon = L.divIcon({
  html: `<div style="...">
    <!-- Your custom HTML/SVG icon -->
  </div>`,
  className: 'custom-marker',
});
```

Or use image icons:

```typescript
const icon = L.icon({
  iconUrl: '/your-marker-icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
```

#### 4. Add Multi-Language Support

For international projects:

1. Install `next-intl`: `npm install next-intl`
2. Create translation files in `locales/`
3. Wrap app in `IntlProvider`
4. Use `t('key')` for translations

#### 5. Change Map Tiles

Use different map styles in admin config:

**Satellite View**:
```
https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
```

**Dark Mode**:
```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png
```

**Watercolor Style**:
```
https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg
```

#### 6. Add Custom Fields

To add fields to pinpoints:

1. **Migrate Database**:
   ```sql
   ALTER TABLE pinpoints ADD COLUMN your_field VARCHAR(255);
   ```

2. **Update TypeScript Interface** in `lib/db.ts`:
   ```typescript
   export interface Pinpoint {
     // ... existing fields
     your_field?: string;
   }
   ```

3. **Update API Routes** in `app/api/pinpoints/route.ts`

4. **Update Admin Form** in `app/admin/page.tsx`

#### 7. Add Categories/Tags

Create a new `categories` table:

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  color VARCHAR(7),  -- hex color
  icon VARCHAR(255)
);

ALTER TABLE pinpoints ADD COLUMN category_id INTEGER REFERENCES categories(id);
```

Then filter markers by category in the map component.

#### 8. Change Branding

- **Logo**: Add your logo to `public/logo.png`
- **Title**: Update `app/layout.tsx` metadata
- **Favicon**: Replace `public/favicon.ico`
- **Name**: Search and replace "O2Paris" throughout codebase

### Advanced Customizations

#### Add User Accounts

Replace simple password auth with NextAuth.js:

1. Install: `npm install next-auth`
2. Configure providers (Google, GitHub, etc.)
3. Protect API routes with `getServerSession`
4. Add user_id foreign key to pinpoints

#### Add Photo Uploads

Similar to sound uploads:

1. Create `photos` table
2. Add `/api/photos` endpoint
3. Display images in popups
4. Use Next.js Image component for optimization

#### Add Routes/Paths

Connect multiple points into guided tours:

1. Create `routes` table with array of pinpoint IDs
2. Draw lines between points on map
3. Add "Play Tour" button for sequential audio

#### Export/Import Data

Add admin features:

- Export to CSV/JSON
- Import from CSV/JSON
- Bulk operations

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Map Not Displaying

**Symptoms**: Blank page, no map visible

**Solutions**:
1. Check browser console (F12) for errors
2. Verify Leaflet CSS is loaded
3. Clear browser cache (Ctrl+F5)
4. Check if JavaScript is enabled
5. Try different browser

**Debug Code**:
```javascript
// Add to Map.tsx
useEffect(() => {
  console.log('Map mounted', { pinpoints, config });
}, [pinpoints, config]);
```

#### Sounds Not Playing

**Symptoms**: Click play button, nothing happens or beep sound

**Solutions**:
1. **Check sound URL**: Verify `/api/sounds?id=X` loads in browser
2. **Check file format**: MP3 works best for browser compatibility
3. **Check file size**: Files over 10MB may time out
4. **Check browser console**: Look for CORS or network errors
5. **Test database**: Query `SELECT id, filename FROM sounds;`
6. **Verify DATABASE_URL**: Must end with `?sslmode=require` for Neon

**Quick Fix**:
Visit `https://your-app.vercel.app/api/sounds?id=1` directly in browser.
If it downloads/plays, the sound works!

#### Admin Login Not Working

**Symptoms**: "Invalid password" even with correct password

**Solutions**:
1. **Verify password**: Check `ADMIN_PASSWORD` in Vercel settings
2. **No trailing spaces**: Ensure no spaces in password value
3. **Case sensitive**: Password is case-sensitive
4. **Redeploy**: After changing env vars, redeploy on Vercel
5. **Clear cookies**: Clear site cookies and try again

**Development Fallback**:
Default password in development: `Admin123`

#### Database Connection Errors

**Symptoms**: "Failed to connect to database" errors

**Solutions**:
1. **Check DATABASE_URL format**:
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```
2. **Verify Neon project is active**: Check Neon dashboard
3. **Check connection limit**: Free tier has connection limits
4. **Test connection**: Use `psql "$DATABASE_URL"` locally
5. **Reinitialize**: Visit `/api/init` to reset tables

#### Build Errors on Vercel

**Symptoms**: Deployment fails during build

**Solutions**:
1. **Check build logs**: Click "View Logs" in Vercel
2. **TypeScript errors**: Fix all type errors locally first
3. **Missing dependencies**: Run `npm install` and commit `package-lock.json`
4. **Node version**: Ensure using Node 18+ (set in `package.json`)
5. **Environment variables**: Set before build, not after

#### Points Not Appearing

**Symptoms**: Map loads but no markers visible

**Solutions**:
1. **Check data**: Visit `/api/pinpoints` to see JSON
2. **Check coordinates**: Verify lat/lng are within visible map area
3. **Check zoom level**: Zoom out to see if markers are off-screen
4. **Check console**: Look for JavaScript errors
5. **Verify database**: Query `SELECT * FROM pinpoints;`

### Getting Help

#### Debug Checklist

Before asking for help, check:

- [ ] Browser console errors (F12 → Console tab)
- [ ] Network tab for failed requests (F12 → Network)
- [ ] Vercel function logs (if deployed)
- [ ] Neon database logs
- [ ] All environment variables are set correctly
- [ ] Database tables exist (`/api/init` was called)
- [ ] You're using a modern browser (Chrome, Firefox, Safari, Edge)

#### Where to Get Help

1. **Check Existing Documentation**:
   - README.md (quick start)
   - TROUBLESHOOTING.md (detailed troubleshooting)
   - FIXING_SOUNDS.md (audio issues)
   - VERCEL_SETUP.md (deployment issues)

2. **GitHub Issues**:
   - Search existing issues: [github.com/mitchlabeetch/o2paris/issues](https://github.com/mitchlabeetch/o2paris/issues)
   - Open a new issue with:
     - Clear description of problem
     - Steps to reproduce
     - Screenshots
     - Error messages from console
     - Environment (browser, OS, deployment platform)

3. **Community Support**:
   - Stack Overflow (tag with `nextjs`, `leaflet`, `postgresql`)
   - Next.js Discord community
   - Vercel Discord community

---

## 🤝 Contributing

We welcome contributions to O2Paris! Whether it's bug fixes, new features, or documentation improvements.

### How to Contribute

1. **Fork the Repository**:
   - Click "Fork" on GitHub
   - Clone your fork: `git clone https://github.com/YOUR_USERNAME/o2paris.git`

2. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**:
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test Your Changes**:
   ```bash
   npm run dev      # Test locally
   npm run build    # Ensure it builds
   npm run lint     # Check for errors
   ```

5. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

6. **Push to GitHub**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open Pull Request**:
   - Go to GitHub
   - Click "New Pull Request"
   - Describe your changes
   - Link any related issues

### Contribution Guidelines

- **Code Style**: Follow TypeScript best practices
- **Commits**: Use clear, descriptive commit messages
- **Testing**: Test thoroughly before submitting
- **Documentation**: Update docs for any user-facing changes
- **Issues**: Reference issue numbers in commits (#123)

### Development Setup

See the [Installation Guide](#-installation-guide) for setting up your development environment.

### Areas We Need Help

- [ ] Unit tests (Jest, React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Internationalization (i18n)
- [ ] Mobile app version
- [ ] Better error handling
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Dark mode support
- [ ] Documentation translations

---

## 📄 License & Credits

### Project Information

- **Project Name**: O2Paris
- **Developed For**: Eau de Paris (Paris Water Authority)
- **Repository**: [github.com/mitchlabeetch/o2paris](https://github.com/mitchlabeetch/o2paris)
- **License**: Custom (see below)

### License

This project was developed specifically for Eau de Paris. However, we encourage and welcome you to use this codebase as a foundation for your own projects!

**You are free to**:
- ✅ Use this code for your own projects
- ✅ Modify and adapt it to your needs
- ✅ Deploy your own instances
- ✅ Learn from the code

**We ask that you**:
- 📝 Give credit to the original O2Paris project
- 🤝 Share improvements back to the community (optional but appreciated)
- ⚠️ Don't claim it as your own original work

### Credits

**Built With**:
- [Next.js](https://nextjs.org) - React framework
- [Leaflet.js](https://leafletjs.com) - Interactive maps
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Vercel](https://vercel.com) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [OpenStreetMap](https://openstreetmap.org) - Map data

**Inspiration**:
- Eau de Paris and their mission to provide clean water
- The sounds of water throughout Paris
- Interactive storytelling through audio

### Contact

For questions about this project:
- Open an issue on [GitHub](https://github.com/mitchlabeetch/o2paris/issues)
- Check existing documentation
- Join the discussion in issues/pull requests

---

## 📖 Additional Resources

### Official Documentation

| Resource | Description |
|----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | 5-minute quick start guide |
| [README.md](./README.md) | Main project overview |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Detailed deployment guide |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Problem-solving guide |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |
| [FIXING_SOUNDS.md](./FIXING_SOUNDS.md) | Audio troubleshooting |
| [VERCEL_SETUP.md](./VERCEL_SETUP.md) | Vercel configuration |

### External Resources

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Leaflet**: [leafletjs.com/reference](https://leafletjs.com/reference.html)
- **React-Leaflet**: [react-leaflet.js.org](https://react-leaflet.js.org/)
- **Neon PostgreSQL**: [neon.tech/docs](https://neon.tech/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

### Tutorials & Guides

- [How to Deploy Next.js to Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Leaflet Quick Start Guide](https://leafletjs.com/examples/quick-start/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 🎉 Conclusion

Thank you for using or contributing to O2Paris! We hope this documentation helps you understand, deploy, and customize the application for your needs.

Whether you're using it for Eau de Paris, adapting it for your city's audio tour, or just learning from the code, we're excited to see what you create!

**Happy mapping! 🗺️💧🎵**

---

*Last updated: December 2024*
*Documentation version: 1.0.0*
*App version: 0.1.0*
