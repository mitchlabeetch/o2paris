import { NextRequest, NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

// Force dynamic rendering and disable caching
// Note: The sounds list (no id param) is not cached
// Individual sound file data (with id param) is cached for 1 day for performance
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante. Initialisez la base avec /api/init.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      // List all sounds
      const sounds = await sql`SELECT id, filename, mime_type, size, created_at FROM sounds ORDER BY id DESC`;
      return NextResponse.json(sounds, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    // Get specific sound
    const result = await sql`SELECT * FROM sounds WHERE id = ${id}`;
    
    if (result.length === 0) {
      console.error(`Sound not found with ID: ${id}`);
      return NextResponse.json(
        { error: 'Sound not found' },
        { status: 404 }
      );
    }

    const sound = result[0];
    
    // Ensure data exists and is in the right format
    if (!sound.data) {
      console.error(`Sound ${id} has no data`);
      return NextResponse.json(
        { error: 'Sound data is missing' },
        { status: 500 }
      );
    }

    // Convert to Buffer if needed
    // Neon returns BYTEA as Buffer by default, but may return Uint8Array in some configurations
    // This ensures we always work with a Buffer for consistent handling
    const audioData = Buffer.isBuffer(sound.data) ? sound.data : Buffer.from(sound.data);
    
    // Return the audio file with reasonable caching (1 day)
    return new NextResponse(audioData, {
      headers: {
        'Content-Type': sound.mime_type,
        'Content-Length': sound.size.toString(),
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching sound:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sound' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante. Initialisez la base avec /api/init.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 4.5MB)
    if (file.size > 4.5 * 1024 * 1024) {
        return NextResponse.json(
            { error: 'File too large (max 4.5MB)' },
            { status: 400 }
        );
    }

    // Validate file type (audio only)
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'File must be an audio file' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const data = Buffer.from(buffer);

    console.log(`Uploading sound: ${file.name}, size: ${file.size}, type: ${file.type}`);

    const result = await sql`
      INSERT INTO sounds (filename, data, mime_type, size)
      VALUES (${file.name}, ${data}, ${file.type}, ${file.size})
      RETURNING id, filename, mime_type, size, created_at
    `;

    console.log(`Sound uploaded successfully with ID: ${result[0].id}`);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error uploading sound:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to upload sound', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante. Initialisez la base avec /api/init.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Sound ID is required' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM sounds WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sound:', error);
    return NextResponse.json(
      { error: 'Failed to delete sound' },
      { status: 500 }
    );
  }
}
