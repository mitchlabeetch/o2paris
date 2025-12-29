import { NextRequest, NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
       return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`SELECT * FROM images WHERE id = ${id}`;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    const image = result[0];

    if (!image.data) {
      return NextResponse.json(
        { error: 'Image data is missing' },
        { status: 500 }
      );
    }

    const imageData = Buffer.isBuffer(image.data) ? image.data : Buffer.from(image.data);

    return new NextResponse(imageData, {
      headers: {
        'Content-Type': image.mime_type,
        'Content-Length': image.size.toString(),
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante.' },
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const dataBuffer = Buffer.from(buffer);
    const hexData = '\\x' + dataBuffer.toString('hex');

    const result = await sql`
      INSERT INTO images (filename, data, mime_type, size)
      VALUES (${file.name}, ${hexData}, ${file.type}, ${file.size})
      RETURNING id, filename, mime_type, size, created_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
