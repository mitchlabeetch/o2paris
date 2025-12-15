# Vercel Environment Setup - O2Paris

## Current Issue
Sounds are not being played when clicked (falling back to beep sound instead). This happens because the DATABASE_URL environment variable is not configured in Vercel.

## Solution

### Step 1: Configure Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `o2paris` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

#### Required Variables:

**DATABASE_URL**
```
postgresql://username:password@host.region.neon.tech/dbname?sslmode=require
```
Replace with your actual Neon PostgreSQL connection string from https://neon.tech

**ADMIN_PASSWORD_HASH**

Generate this with:
```bash
git clone https://github.com/mitchlabeetch/o2paris.git
cd o2paris
npm install
# Replace YourSecurePassword with your actual password
npm run generate-password YourSecurePassword
```

Then copy the generated hash to Vercel.

### Step 2: Redeploy

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Click the **...** menu → **Redeploy**
4. Check "Use existing Build Cache" is **unchecked** (force rebuild)
5. Click **Redeploy**

### Step 3: Initialize Database

Once redeployed, visit:
```
https://your-app.vercel.app/api/init
```

You should see:
```json
{"message":"Database initialized successfully","success":true}
```

This will create all necessary tables and seed initial data.

### Step 4: Verify Sounds Work

1. Visit your deployed site: `https://your-app.vercel.app`
2. Click on any pinpoint marker on the map
3. Click the play button ▶
4. The sound should now play properly (no longer falling back to beep)

## Why This Fixes the Issue

### Before (Without DATABASE_URL):
```
User clicks marker → Opens popup → Tries to load sound
                                  ↓
                    External Pixabay CDN URL (may be blocked/broken)
                                  ↓
                    Fails to load → Falls back to beep sound
```

### After (With DATABASE_URL):
```
User clicks marker → Opens popup → Tries to load sound
                                  ↓
                    Loads from database via /api/sounds?id=X
                                  ↓
                    Successfully plays sound from database
```

## Troubleshooting

### Still hearing beep sounds after setup?

1. **Clear browser cache**: Press Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Check database initialized**: Visit `/api/init` again
3. **Verify environment variables**: 
   - Go to Vercel → Settings → Environment Variables
   - Ensure DATABASE_URL is exactly as shown above
   - Ensure no extra spaces or characters

### Database initialization fails?

1. **Check DATABASE_URL format**: Must be a valid PostgreSQL connection string (format: `postgresql://username:password@host.region.neon.tech/dbname?sslmode=require`)
2. **Check Neon database is active**: Log into https://neon.tech and verify the database exists
3. **Try manual SQL**: 
   - Go to Neon SQL Editor
   - Run the migrations from `scripts/migrations/001_init.sql` manually

### Sounds still not uploading?

1. **Check file size**: Max 4.5MB per file
2. **Check file format**: Must be audio/* MIME type (MP3, OGG, WAV, etc.)
3. **Check admin authentication**: Make sure you're logged in to /admin

## Security Notes

- Never commit `.env` file to Git (already in .gitignore)
- Never share DATABASE_URL publicly
- Use a strong admin password (12+ characters)
- Rotate admin password regularly

## Need Help?

Open an issue on GitHub with:
- Error messages from browser console (F12)
- Screenshots of the issue
- Your Vercel deployment logs
