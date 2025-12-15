# Fixing Sound Playback Issues - Complete Guide

## Problem Description

**Issue**: When clicking on pinpoint markers, sounds do not play and instead fall back to a beep sound.

**Root Cause**: The application is using fallback pinpoints with external CDN URLs (Pixabay) that may be:
- Blocked by CORS policies
- Rate-limited or unavailable
- No longer accessible

## Complete Solution

### Why External URLs Fail

When `DATABASE_URL` is not configured, the application uses hardcoded fallback pinpoints:

```typescript
// From lib/db.ts - SEED_PINPOINTS
{
  title: 'Berges de Seine',
  sound_url: 'https://cdn.pixabay.com/download/audio/...',  // External URL
}
```

**Problems with external URLs:**
1. ❌ CORS (Cross-Origin Resource Sharing) restrictions
2. ❌ Rate limiting from external CDN
3. ❌ URLs can break or change
4. ❌ No control over availability
5. ❌ Potential hotlinking restrictions

### How Database Storage Fixes This

With `DATABASE_URL` configured, sounds are stored internally:

```typescript
// Sounds stored in PostgreSQL as BYTEA (binary data)
// Accessed via: /api/sounds?id=1

{
  title: 'Berges de Seine',
  sound_url: '/api/sounds?id=1',  // Internal API endpoint
}
```

**Benefits:**
1. ✅ No CORS issues (same origin)
2. ✅ Complete control over availability
3. ✅ No external dependencies
4. ✅ Better performance (CDN-cacheable)
5. ✅ Secure and reliable

## Step-by-Step Fix

### Step 1: Configure DATABASE_URL in Vercel

Your Neon PostgreSQL connection string should look like this:
```
postgresql://username:password@host.region.neon.tech/dbname?sslmode=require
```

**To add it to Vercel:**

1. Go to https://vercel.com/dashboard
2. Select your `o2paris` project
3. Navigate to: **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `DATABASE_URL`
   - **Value**: (paste the connection string above)
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**

### Step 2: Generate and Set Admin Password

```bash
# Clone the repository (if not already done)
git clone https://github.com/mitchlabeetch/o2paris.git
cd o2paris

# Install dependencies
npm install

# Generate password hash (replace YourSecurePassword123 with your actual password)
npm run generate-password YourSecurePassword123

# Copy the output hash
```

Add to Vercel:
1. Settings → Environment Variables
2. Key: `ADMIN_PASSWORD_HASH`
3. Value: (paste the hash)
4. Environments: All
5. Save

### Step 3: Redeploy Application

**Important**: Must redeploy to apply environment variables!

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **...** menu → **Redeploy**
4. ⚠️ **Uncheck** "Use existing Build Cache" (force rebuild)
5. Click **Redeploy**
6. Wait for deployment to complete

### Step 4: Initialize Database

Once deployed, visit:
```
https://your-app.vercel.app/api/init
```

**Expected Response:**
```json
{
  "message": "Database initialized successfully. Tables created and sample data seeded if empty.",
  "info": "Note: This endpoint only seeds data if tables are empty to prevent duplicates.",
  "seededPinpoints": 3,
  "success": true
}
```

This creates:
- ✅ `pinpoints` table
- ✅ `sounds` table (for storing audio files)
- ✅ `map_config` table
- ✅ Sample pinpoints (initially with external URLs)

### Step 5: Upload Sounds to Database

Now upload sounds to replace external URLs:

1. **Go to Admin Panel**:
   ```
   https://your-app.vercel.app/admin
   ```

2. **Login** with your password from Step 2

3. **Go to "Sons" (Sounds) Tab**

4. **Upload Audio Files**:
   - Click "Choose File"
   - Select an audio file (MP3, WAV, OGG)
   - Max size: 4.5 MB
   - Click "Upload"
   - **Note the Sound ID** returned (e.g., `1`)

5. **Repeat** for each sound you want to add

### Step 6: Update Pinpoints to Use Internal Sounds

1. **Go to "Points sur la carte" Tab**

2. **For Each Pinpoint**:
   - Click "Modifier" (Edit)
   - Update **"URL du son"** field
   - Change from external URL to: `/api/sounds?id=1` (use your sound ID)
   - Click "Sauvegarder" (Save)

### Step 7: Verify Fix

1. **Clear Browser Cache**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Visit**: `https://your-app.vercel.app`
3. **Click** on any pinpoint marker
4. **Press** play button ▶
5. **Confirm**: Sound plays correctly (not beep!)

## Alternative: Upload Sounds First, Then Create New Pinpoints

Instead of editing existing pinpoints, you can:

1. **Upload sounds** first (Steps 5)
2. **Delete** old pinpoints with external URLs
3. **Create new pinpoints** with internal sound URLs from the start

### Example: Creating a New Water Sound Pinpoint

1. **Upload Sound**:
   - Admin → Sons tab
   - Upload `seine-water.mp3`
   - Note ID: `1`

2. **Create Pinpoint**:
   - Admin → Points sur la carte → + Nouveau point
   - **Latitude**: `48.8566`
   - **Longitude**: `2.3522`
   - **Titre**: `Berges de Seine`
   - **Description**: `L'eau douce qui coule le long de la Seine`
   - **URL du son**: `/api/sounds?id=1`
   - **Icon**: `🌊`
   - Click "Sauvegarder"

3. **Test**: Click marker on map → Sound plays!

## Finding Quality Water Sounds

### Free Sound Libraries

1. **Freesound.org**
   - Search: "water flowing", "fountain", "river"
   - License: Creative Commons (check attribution requirements)
   - Download format: MP3 or OGG

2. **ZapSplat.com**
   - Free sound effects
   - Water category
   - No attribution required for free tier

3. **BBC Sound Effects**
   - Archive of professional recordings
   - Free for personal/education
   - High quality WAV files

### Recommended Search Terms

- "water flowing"
- "fountain ambiance"
- "river Seine"
- "rain on water"
- "gentle stream"
- "water droplets"
- "canal lock"

### Audio Optimization

Before uploading, optimize your audio:

```bash
# Using ffmpeg (if installed)
# Reduce bitrate to 128kbps, convert to MP3
ffmpeg -i input.wav -b:a 128k -ac 2 output.mp3

# Or use online tools:
# - https://www.freeconvert.com/audio-compressor
# - https://www.mp3smaller.com/
```

**Target specs:**
- Format: MP3 or OGG
- Bitrate: 128-192 kbps
- Channels: Stereo or Mono
- Size: Under 4.5 MB

## Troubleshooting

### "Sounds still not playing after setup"

1. **Check sound URLs in database**:
   - Login to Neon SQL Editor
   - Run: `SELECT id, title, sound_url FROM pinpoints;`
   - Verify URLs are `/api/sounds?id=X`, not external URLs

2. **Test sound endpoint directly**:
   ```bash
   # Should return audio file, not error
   curl -I https://your-app.vercel.app/api/sounds?id=1
   ```

3. **Check browser console**:
   - Press F12
   - Look for CORS or 404 errors
   - Fix based on error message

### "Sound uploads fail"

1. **Check file size**: Must be under 4.5 MB
2. **Check format**: Must be audio/* MIME type
3. **Check admin auth**: Make sure you're logged in
4. **Check DATABASE_URL**: Must be set for uploads to work

### "Database initialization fails"

1. **Verify DATABASE_URL** format:
   ```
   postgresql://user:pass@host.region.neon.tech/db?sslmode=require
   ```

2. **Check Neon status**: https://neon.tech/status

3. **Try manual SQL**:
   - Go to Neon SQL Editor
   - Run contents of `scripts/migrations/001_init.sql`

## Testing Checklist

After completing all steps, verify:

- [ ] Visit `/api/init` → Returns success
- [ ] Visit `/admin` → Can login
- [ ] Admin → Sons → Can upload a sound
- [ ] Admin → Points → Can create/edit pinpoints
- [ ] Visit main page → Markers appear on map
- [ ] Click marker → Popup opens
- [ ] Click play → Sound plays (not beep!)
- [ ] Test on mobile device
- [ ] Test in different browsers

## Security Notes

✅ **Do's:**
- Use strong admin password (12+ characters)
- Rotate password regularly
- Keep DATABASE_URL secret
- Use environment variables (never commit .env)

❌ **Don'ts:**
- Don't commit `.env` to git
- Don't share DATABASE_URL publicly
- Don't use default passwords in production
- Don't skip the redeploy step

## Summary

**The Fix in One Sentence:**
Configure `DATABASE_URL` in Vercel → Redeploy → Initialize database → Upload sounds → Update pinpoints to use `/api/sounds?id=X` URLs instead of external URLs.

**Why It Works:**
Sounds stored in database and served via API endpoint eliminate external dependency issues and provide reliable, CORS-free audio playback.

---

**Need more help?** See:
- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Environment setup
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
