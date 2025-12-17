import { NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

// API endpoint to audit and fix sound URLs in the database
// Access via: GET /api/fix-sounds
export async function GET() {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 503 }
      );
    }

    // Get all pinpoints
    const pinpoints = await sql`SELECT id, title, sound_url FROM pinpoints ORDER BY id`;
    
    // Get all sounds
    const sounds = await sql`SELECT id, filename FROM sounds ORDER BY id`;
    
    // Find pinpoints with external URLs
    const externalPinpoints = pinpoints.filter((p: { sound_url?: string }) => 
      p.sound_url?.startsWith('http')
    );
    
    const results = {
      pinpoints_total: pinpoints.length,
      sounds_total: sounds.length,
      external_urls_found: externalPinpoints.length,
      fixed: [] as string[],
      message: ''
    };

    if (externalPinpoints.length > 0 && sounds.length > 0) {
      // Fix external URLs by mapping to internal sounds
      for (let i = 0; i < externalPinpoints.length; i++) {
        const pinpoint = externalPinpoints[i] as { id: number; title: string };
        const soundId = (sounds[i % sounds.length] as { id: number }).id;
        
        await sql`UPDATE pinpoints SET sound_url = ${`/api/sounds?id=${soundId}`} WHERE id = ${pinpoint.id}`;
        results.fixed.push(`Pinpoint ${pinpoint.id} (${pinpoint.title}) -> /api/sounds?id=${soundId}`);
      }
      results.message = `Fixed ${results.fixed.length} pinpoints to use internal sound URLs`;
    } else if (externalPinpoints.length > 0 && sounds.length === 0) {
      results.message = 'External URLs found but no sounds in database. Upload sounds via admin panel first.';
    } else {
      results.message = 'All pinpoints already use internal sound URLs!';
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fixing sounds:', error);
    return NextResponse.json(
      { error: 'Failed to fix sounds' },
      { status: 500 }
    );
  }
}
