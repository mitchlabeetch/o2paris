import { NextRequest, NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json({ error: 'DB Error' }, { status: 503 });
    }

    const { id } = params;
    const body = await request.json();
    const { title, description, sound_url, image_url, style_config } = body;

    const result = await sql`
      UPDATE tiles
      SET title = ${title},
          description = ${description},
          sound_url = ${sound_url},
          image_url = ${image_url},
          style_config = ${JSON.stringify(style_config)},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Tile not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating tile:', error);
    return NextResponse.json({ error: 'Failed to update tile' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json({ error: 'DB Error' }, { status: 503 });
    }

    const { id } = params;
    await sql`DELETE FROM tiles WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tile:', error);
    return NextResponse.json({ error: 'Failed to delete tile' }, { status: 500 });
  }
}
