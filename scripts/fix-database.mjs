// Script to audit and fix O2Paris database
// Run with: node --experimental-modules scripts/fix-database.mjs

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_XHto87GONDiu@ep-quiet-hat-agtqdlpy-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function auditAndFix() {
  console.log('🔍 Auditing O2Paris database...\n');

  try {
    // 1. Check tables exist
    console.log('📋 Checking tables...');
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables found:', tables.map(t => t.table_name).join(', '));

    // 2. Check pinpoints
    console.log('\n📍 Checking pinpoints...');
    const pinpoints = await sql`SELECT id, title, latitude, longitude, sound_url FROM pinpoints ORDER BY id`;
    console.log(`Found ${pinpoints.length} pinpoints:`);
    pinpoints.forEach(p => {
      const isExternal = p.sound_url?.startsWith('http');
      console.log(`  - ID ${p.id}: "${p.title}" | sound: ${isExternal ? '❌ EXTERNAL URL' : '✅ Internal'}`);
    });

    // 3. Check sounds
    console.log('\n🎵 Checking sounds table...');
    const sounds = await sql`SELECT id, filename, mime_type, size FROM sounds ORDER BY id`;
    console.log(`Found ${sounds.length} sounds:`);
    sounds.forEach(s => {
      console.log(`  - ID ${s.id}: "${s.filename}" (${(s.size / 1024).toFixed(1)} KB)`);
    });

    // 4. Fix external URLs if internal sounds exist
    const externalPinpoints = pinpoints.filter(p => p.sound_url?.startsWith('http'));
    
    if (externalPinpoints.length > 0 && sounds.length > 0) {
      console.log('\n🔧 Fixing external sound URLs...');
      
      for (let i = 0; i < externalPinpoints.length; i++) {
        const pinpoint = externalPinpoints[i];
        // Map to available sound IDs (cycle if more pinpoints than sounds)
        const soundId = sounds[i % sounds.length].id;
        
        await sql`UPDATE pinpoints SET sound_url = ${`/api/sounds?id=${soundId}`} WHERE id = ${pinpoint.id}`;
        console.log(`  ✅ Updated pinpoint ${pinpoint.id} to use /api/sounds?id=${soundId}`);
      }
      
      console.log('\n✨ Database fixed! Sound URLs now point to internal API.');
    } else if (externalPinpoints.length > 0 && sounds.length === 0) {
      console.log('\n⚠️  WARNING: Found external URLs but no sounds in database.');
      console.log('   Please upload sounds via the admin panel, then run this script again.');
      console.log('   Or the sounds will fall back to the beep sound.');
    } else {
      console.log('\n✅ All pinpoints already use internal sound URLs!');
    }

    // 5. Check map_config
    console.log('\n🗺️  Checking map config...');
    const config = await sql`SELECT * FROM map_config LIMIT 1`;
    if (config.length > 0) {
      console.log(`  Center: ${config[0].center_lat}, ${config[0].center_lng}`);
      console.log(`  Zoom: ${config[0].zoom_level} (min: ${config[0].min_zoom}, max: ${config[0].max_zoom})`);
    } else {
      console.log('  No config found - will use defaults');
    }

    console.log('\n🎉 Database audit complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

auditAndFix();
