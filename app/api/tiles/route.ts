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

    const tiles = await sql`SELECT * FROM tiles ORDER BY display_order ASC, id ASC`;
    return NextResponse.json(tiles);

  } catch (error) {
    console.error('Error fetching tiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tiles' },
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

    const body = await request.json();
    const { title, description, sound_url, image_url, style_config } = body;

    // Get max display order
    const maxOrderResult = await sql`SELECT MAX(display_order) as max_order FROM tiles`;
    const nextOrder = (Number(maxOrderResult[0].max_order) || 0) + 1;

    const result = await sql`
      INSERT INTO tiles (title, description, sound_url, image_url, display_order, style_config)
      VALUES (${title}, ${description}, ${sound_url}, ${image_url}, ${nextOrder}, ${JSON.stringify(style_config)})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating tile:', error);
    return NextResponse.json(
      { error: 'Failed to create tile' },
      { status: 500 }
    );
  }
}
