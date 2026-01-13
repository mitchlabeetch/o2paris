/**
 * -----------------------------------------------------------------------------
 * FICHIER : app/api/tiles/[id]/route.ts
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le "chirurgien" des tuiles. Contrairement à la route parente qui gère la liste,
 * celle-ci s'occupe d'UNE tuile précise identifiée par son ID.
 *
 * FONCTIONNEMENT :
 * Le nom du dossier "[id]" est spécial dans Next.js. Il signifie que cette route
 * capture n'importe quelle valeur à la fin de l'URL.
 * Exemple : un appel à "/api/tiles/123" activera ce fichier avec id="123".
 *
 * REPÈRES :
 * - Lignes 21-50 : La fonction PUT (Mise à jour / Modification).
 * - Lignes 52-66 : La fonction DELETE (Suppression).
 * -----------------------------------------------------------------------------
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

// Force le mode dynamique (pas de cache) pour toujours agir sur les données réelles
export const dynamic = 'force-dynamic';

// -----------------------------------------------------------------------------
// MÉTHODE PUT (MODIFICATION)
// -----------------------------------------------------------------------------
// Appelée quand on sauvegarde une modification dans l'admin.
// Note : "params" contient l'ID extrait de l'URL.
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json({ error: 'DB Error' }, { status: 503 });
    }

    const { id } = params;
    // Lecture des nouvelles données envoyées
    const body = await request.json();
    const { title, description, sound_url, image_url, style_config } = body;

    // Requête SQL de mise à jour
    // On met à jour tous les champs et aussi la date "updated_at"
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

    // Si aucune ligne n'a été modifiée, c'est que l'ID n'existe pas
    if (result.length === 0) {
      return NextResponse.json({ error: 'Tile not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating tile:', error);
    return NextResponse.json({ error: 'Failed to update tile' }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// MÉTHODE DELETE (SUPPRESSION)
// -----------------------------------------------------------------------------
// Appelée quand on clique sur la poubelle dans l'admin.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json({ error: 'DB Error' }, { status: 503 });
    }

    const { id } = params;
    // Requête SQL de suppression simple
    await sql`DELETE FROM tiles WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tile:', error);
    return NextResponse.json({ error: 'Failed to delete tile' }, { status: 500 });
  }
}