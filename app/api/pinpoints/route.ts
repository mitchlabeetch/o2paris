import { NextRequest, NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

export async function GET() {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante. Initialisez la base avec /api/init.' },
        { status: 503 }
      );
    }

    const pinpoints = await sql`SELECT * FROM pinpoints ORDER BY id`;
    return NextResponse.json(pinpoints);
  } catch (error) {
    console.error('Error fetching pinpoints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pinpoints' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, title, description, sound_url, icon } = body;

    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante. Initialisez la base avec /api/init.' },
        { status: 503 }
      );
    }

    if (latitude === undefined || longitude === undefined || !title || !sound_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO pinpoints (latitude, longitude, title, description, sound_url, icon)
      VALUES (${latitude}, ${longitude}, ${title}, ${description}, ${sound_url}, ${icon})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating pinpoint:', error);
    return NextResponse.json(
      { error: 'Failed to create pinpoint' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, latitude, longitude, title, description, sound_url, icon } = body;

    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante. Initialisez la base avec /api/init.' },
        { status: 503 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Pinpoint ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE pinpoints
      SET 
        latitude = ${latitude},
        longitude = ${longitude},
        title = ${title},
        description = ${description},
        sound_url = ${sound_url},
        icon = ${icon},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Pinpoint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating pinpoint:', error);
    return NextResponse.json(
      { error: 'Failed to update pinpoint' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante. Initialisez la base avec /api/init.' },
        { status: 503 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Pinpoint ID is required' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM pinpoints WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pinpoint:', error);
    return NextResponse.json(
      { error: 'Failed to delete pinpoint' },
      { status: 500 }
    );
  }
}
