# Troubleshooting Guide - O2Paris

## 🔊 Sounds Not Playing (Falling Back to Beep)

### Symptom
When you click on a pinpoint marker and press play, instead of hearing the expected sound, you hear a short beep sound.

### Root Cause
The `DATABASE_URL` environment variable is not properly configured in your Vercel deployment. Without it, the application falls back to using hardcoded external URLs that may be blocked or unavailable.

### Solution
Follow these steps in order:

#### 1. Configure DATABASE_URL in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon PostgreSQL connection string
   - **Environments**: Check all (Production, Preview, Development)

The connection string format is:
```
postgresql://username:password@host.region.neon.tech/database?sslmode=require
```

#### 2. Redeploy Your Application

1. Go to the **Deployments** tab
2. Click on the latest deployment
3. Click **...** (three dots) → **Redeploy**
4. **Important**: Uncheck "Use existing Build Cache"
5. Click **Redeploy**

#### 3. Initialize the Database

After the deployment completes, visit:
```
https://your-domain.vercel.app/api/init
```

Expected response:
```json
{"message":"Database initialized successfully","success":true}
```

#### 4. Test

1. Visit your site
2. Click any marker
3. Click play ▶
4. Sound should now play correctly!

### Still Not Working?

#### Check Environment Variables
```bash
# In your Vercel dashboard
Settings → Environment Variables → Verify DATABASE_URL exists
```

#### Check Database Connection
```bash
# Visit in your browser
https://your-domain.vercel.app/api/config

# Should return configuration, not an error
```

#### Clear Cache
- Browser cache: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Vercel cache: Redeploy with "Use existing Build Cache" unchecked

---

## 🔐 Cannot Login to Admin Panel

### Symptom
Password is rejected when trying to access `/admin`

### Solutions

#### 1. Verify ADMIN_PASSWORD_HASH is Set

In Vercel:
1. Settings → Environment Variables
2. Check that `ADMIN_PASSWORD_HASH` exists

#### 2. Generate New Password Hash

```bash
cd o2paris
npm install
npm run generate-password YourNewPassword
```

Copy the output hash to Vercel's `ADMIN_PASSWORD_HASH` variable, then redeploy.

#### 3. Development Default

In local development (without `ADMIN_PASSWORD_HASH` set), the default password is:
```
Admin123
```

---

## 🗺️ Map Not Displaying

### Symptom
The map doesn't load, or you see a blank screen

### Solutions

#### 1. Check Browser Console
1. Press F12 to open Developer Tools
2. Look for errors in the Console tab
3. Common errors:
   - "Leaflet is not defined" → Refresh page
   - "Failed to fetch" → Check network connection
   - "Maximum call stack size exceeded" → Clear cache and refresh

#### 2. Clear Browser Cache
- Chrome/Edge: Ctrl+Shift+Delete
- Firefox: Ctrl+Shift+Delete
- Safari: Cmd+Option+E

#### 3. Check Map Configuration
Visit `/admin` and check the "Configuration" tab:
- Tile Layer URL should be valid
- Center coordinates should be reasonable (Paris: ~48.8566, 2.3522)
- Zoom levels should be: min 10, initial 13, max 18

---

## 🎵 Cannot Upload Sounds

### Symptom
Sound upload fails in admin panel

### Solutions

#### 1. Check File Size
Maximum file size is **4.5 MB**. Compress your audio if needed:
```bash
# Using ffmpeg (example)
ffmpeg -i input.mp3 -b:a 128k output.mp3
```

#### 2. Check File Format
Supported formats: MP3, WAV, OGG, AAC, M4A

Verify MIME type is `audio/*`

#### 3. Check Database Connection
If DATABASE_URL is not set, sound uploads will fail.

---

## 🔄 Database Not Initializing

### Symptom
Visiting `/api/init` returns an error

### Solutions

#### 1. Verify DATABASE_URL Format
Must be a valid PostgreSQL connection string:
```
postgresql://user:password@host.region.neon.tech/dbname?sslmode=require
```

#### 2. Check Neon Database Status
1. Login to https://neon.tech
2. Verify your database is active (not suspended)
3. Check connection limits haven't been exceeded

#### 3. Manual Initialization
If API initialization fails, run SQL manually:

1. Go to Neon SQL Editor
2. Copy content from `scripts/migrations/001_init.sql`
3. Execute the SQL directly

---

## 📡 API Endpoints Not Working

### Symptom
API calls return 500 or 503 errors

### Common Causes & Solutions

#### DATABASE_URL Not Set
**Error**: `DATABASE_URL manquante. Initialisez la base avec /api/init.`

**Solution**: Set DATABASE_URL in Vercel environment variables

#### Network Timeout
**Error**: `Failed to fetch` or timeout errors

**Solution**: 
- Check Neon database is accessible
- Verify no firewall blocking connection
- Check Neon status page

#### Invalid Query
**Error**: SQL syntax errors

**Solution**: Check for:
- Special characters in pinpoint data
- Proper escaping of strings
- Valid data types

---

## 🚀 Deployment Checklist

Before deploying, verify:

- [ ] `DATABASE_URL` is set in Vercel
- [ ] `ADMIN_PASSWORD_HASH` is set in Vercel
- [ ] Database initialized (visit `/api/init`)
- [ ] Can login to admin panel
- [ ] Can create/edit/delete pinpoints
- [ ] Sounds upload successfully
- [ ] Sounds play when clicked
- [ ] Map displays correctly
- [ ] Mobile responsive

---

## 📞 Getting Help

If you've tried all solutions above and still have issues:

1. **Check Documentation**:
   - [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Environment setup
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
   - [README.md](./README.md) - General documentation

2. **Check Logs**:
   - Vercel: Dashboard → Your Project → Functions tab
   - Browser: F12 → Console tab
   - Neon: Dashboard → Your Database → Logs

3. **Open an Issue**:
   - Go to GitHub Issues
   - Include: error messages, logs, steps to reproduce
   - Be specific about what you've already tried

4. **Common Resources**:
   - Vercel Docs: https://vercel.com/docs
   - Neon Docs: https://neon.tech/docs
   - Next.js Docs: https://nextjs.org/docs

---

## 🔍 Debugging Tips

### Enable Verbose Logging
Add this to your local `.env`:
```
NODE_ENV=development
```

### Test API Endpoints Directly
```bash
# Test pinpoints
curl https://your-domain.vercel.app/api/pinpoints

# Test sounds list
curl https://your-domain.vercel.app/api/sounds

# Test specific sound
curl https://your-domain.vercel.app/api/sounds?id=1

# Test config
curl https://your-domain.vercel.app/api/config
```

### Check Database Content
Via Neon SQL Editor:
```sql
-- Check pinpoints
SELECT * FROM pinpoints;

-- Check sounds
SELECT id, filename, mime_type, size, created_at FROM sounds;

-- Check config
SELECT * FROM map_config;
```

---

## 💡 Pro Tips

1. **Always redeploy after environment variable changes**
2. **Clear cache when debugging CSS/JS issues**
3. **Test in incognito mode to avoid cache issues**
4. **Check mobile view** - some issues only appear on mobile
5. **Use browser dev tools network tab** to see failed requests
6. **Keep backups** of your database and pinpoints

---

**Last Updated**: December 2024
