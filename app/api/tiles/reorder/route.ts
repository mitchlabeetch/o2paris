/**
 * FICHIER : app/api/tiles/reorder/route.ts
 * RÔLE : Sauvegarde l'ordre des tuiles après un drag-drop.
 * POST : Reçoit un array d'IDs en nouvel ordre (orderedIds).
 * Flux : AdminTileGrid (dnd-kit) -> POST /api/tiles/reorder -> UPDATE display_order.
 * Résultat : Les tuiles dans TileGrid s'affichent dans le nouvel ordre.
 * Utilisé par : AdminTileGrid.tsx (drag-drop de tuiles).
 * Mise à jour : Sequential UPDATE (pas de transaction complexe).
 * Note : display_order sert de clé de tri (ORDER BY display_order ASC).
 * _____________________________________________________________________________
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json({ error: 'DB Error' }, { status: 503 });
    }

    const { orderedIds } = await request.json(); // Expecting array of IDs in new order

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Process reordering efficiently using a batch update
    // We construct a JSON array of updates and use jsonb_to_recordset to apply them in a single query
    const updates = orderedIds.map((id: number, index: number) => ({
      id,
      display_order: index + 1,
    }));

    await sql`
      UPDATE tiles
      SET display_order = x.display_order
      FROM jsonb_to_recordset(${JSON.stringify(updates)}::jsonb) AS x(id int, display_order int)
      WHERE tiles.id = x.id
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering tiles:', error);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
