import { NextRequest, NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

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
      return NextResponse.json(sounds);
    }

    // Get specific sound
    const result = await sql`SELECT * FROM sounds WHERE id = ${id}`;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Sound not found' },
        { status: 404 }
      );
    }

    const sound = result[0];
    
    // Return the audio file with reasonable caching (1 day)
    return new NextResponse(sound.data, {
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

    const result = await sql`
      INSERT INTO sounds (filename, data, mime_type, size)
      VALUES (${file.name}, ${data}, ${file.type}, ${file.size})
      RETURNING id, filename, mime_type, size, created_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error uploading sound:', error);
    return NextResponse.json(
      { error: 'Failed to upload sound' },
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
