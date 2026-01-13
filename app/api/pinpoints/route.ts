/**
 * FICHIER : app/api/pinpoints/route.ts
 * RÔLE : API de gestion des points d'intérêt (marqueurs sur la carte).
 * GET : Récupère tous les pinpoints (conversion DECIMAL en Number).
 * POST : Crée un nouveau pinpoint (latitude, longitude, titre, son, icône).
 * Similaire à : app/api/tiles/route.ts (liste + création).
 * Stockage : table pinpoints (SERIAL id, coordonnées, description).
 * Utilisation : PinpointList.tsx et Map.tsx.
 * Validation : latitude/longitude requises, titre requis, son requis.
 * Note : Legacy (l'app pivot vers TileGrid pour la nav principale).
 * _____________________________________________________________________________
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante. Initialisez la base avec /api/init.' },
        { status: 503 }
      );
    }

    const pinpoints = await sql`SELECT * FROM pinpoints ORDER BY id`;
    // Convert DECIMAL strings to numbers for latitude/longitude
    const normalizedPinpoints = pinpoints.map((p: Record<string, unknown>) => ({
      ...p,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
    }));
    return NextResponse.json(normalizedPinpoints, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
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

    console.log(`Creating pinpoint: ${title} with sound URL: ${sound_url}`);

    const result = await sql`
      INSERT INTO pinpoints (latitude, longitude, title, description, sound_url, icon)
      VALUES (${latitude}, ${longitude}, ${title}, ${description}, ${sound_url}, ${icon})
      RETURNING *
    `;

    console.log(`Pinpoint created successfully with ID: ${result[0].id}`);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating pinpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create pinpoint', details: errorMessage },
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

    console.log(`Updating pinpoint ${id}: ${title} with sound URL: ${sound_url}`);

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
      console.error(`Pinpoint not found with ID: ${id}`);
      return NextResponse.json(
        { error: 'Pinpoint not found' },
        { status: 404 }
      );
    }

    console.log(`Pinpoint ${id} updated successfully`);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating pinpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update pinpoint', details: errorMessage },
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
