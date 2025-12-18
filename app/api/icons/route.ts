import { NextRequest, NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

// Force dynamic rendering and disable caching
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
      // List all icons
      const icons = await sql`SELECT id, filename, mime_type, size, created_at FROM custom_icons ORDER BY id DESC`;
      return NextResponse.json(icons, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    // Get specific icon
    const result = await sql`SELECT * FROM custom_icons WHERE id = ${id}`;
    
    if (result.length === 0) {
      console.error(`Icon not found with ID: ${id}`);
      return NextResponse.json(
        { error: 'Icon not found' },
        { status: 404 }
      );
    }

    const icon = result[0];
    
    // Ensure data exists and is in the right format
    if (!icon.data) {
      console.error(`Icon ${id} has no data`);
      return NextResponse.json(
        { error: 'Icon data is missing' },
        { status: 500 }
      );
    }

    // Convert to Buffer if needed
    const imageData = Buffer.isBuffer(icon.data) ? icon.data : Buffer.from(icon.data);
    
    // Return the image file with reasonable caching (1 day)
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': icon.mime_type,
        'Content-Length': icon.size.toString(),
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching icon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch icon' },
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

    // Validate file size (max 500KB for icons)
    if (file.size > 500 * 1024) {
        return NextResponse.json(
            { error: 'File too large (max 500KB)' },
            { status: 400 }
        );
    }

    // Validate file type (image only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const dataBuffer = Buffer.from(buffer);

    // Convert buffer to Postgres hex format for BYTEA
    const hexData = '\\x' + dataBuffer.toString('hex');

    console.log(`Uploading icon: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Insert using the hex string format which Postgres treats as a BYTEA literal
    const result = await sql`
      INSERT INTO custom_icons (filename, data, mime_type, size)
      VALUES (${file.name}, ${hexData}, ${file.type}, ${file.size})
      RETURNING id, filename, mime_type, size, created_at
    `;

    console.log(`Icon uploaded successfully with ID: ${result[0].id}`);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error uploading icon:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to upload icon', details: errorMessage },
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
        { error: 'Icon ID is required' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM custom_icons WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting icon:', error);
    return NextResponse.json(
      { error: 'Failed to delete icon' },
      { status: 500 }
    );
  }
}
