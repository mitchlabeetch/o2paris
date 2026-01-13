/**
 * -----------------------------------------------------------------------------
 * FICHIER : app/api/tiles/route.ts
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le "guichetier" des tuiles. Cette API permet au Frontend de demander
 * la liste des tuiles (GET) ou d'en créer une nouvelle (POST).
 *
 * FONCTIONNEMENT :
 * Elle parle directement à la base de données PostgreSQL via la librairie @neondatabase/serverless.
 *
 * REPÈRES :
 * - Lignes 21-39 : La fonction GET (Lecture).
 * - Lignes 41-72 : La fonction POST (Création).
 * -----------------------------------------------------------------------------
 */

// Import des types Next.js pour gérer les requêtes HTTP
import { NextRequest, NextResponse } from 'next/server';
// Import de notre outil de connexion à la base de données
import { hasValidDatabaseUrl, sql } from '@/lib/db';

// -----------------------------------------------------------------------------
// CONFIGURATION DU CACHE
// -----------------------------------------------------------------------------
// "force-dynamic" oblige Next.js à exécuter ce code à chaque requête.
// C'est crucial car on veut voir les nouvelles tuiles immédiatement, sans attendre.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// -----------------------------------------------------------------------------
// MÉTHODE GET (LECTURE)
// -----------------------------------------------------------------------------
// Appelée quand on fait fetch('/api/tiles')
export async function GET(request: NextRequest) {
  try {
    // Vérification de sécurité : est-ce que la base de données est configurée ?
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante.' },
        { status: 503 }
      );
    }

    // Requête SQL : Sélectionne TOUT (*) depuis la table "tiles"
    // Trié par ordre d'affichage (display_order) puis par ID.
    const tiles = await sql`SELECT * FROM tiles ORDER BY display_order ASC, id ASC`;
    
    // Renvoie le résultat au format JSON
    return NextResponse.json(tiles);

  } catch (error) {
    console.error('Error fetching tiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tiles' },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// MÉTHODE POST (CRÉATION)
// -----------------------------------------------------------------------------
// Appelée quand l'admin envoie un formulaire pour créer une tuile
export async function POST(request: NextRequest) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante.' },
        { status: 503 }
      );
    }

    // Lecture des données envoyées par le navigateur
    const body = await request.json();
    const { title, description, sound_url, image_url, style_config } = body;

    // Calcul de l'ordre d'affichage : on prend le max actuel et on ajoute 1
    // pour que la nouvelle tuile apparaisse à la fin.
    const maxOrderResult = await sql`SELECT MAX(display_order) as max_order FROM tiles`;
    const nextOrder = (Number(maxOrderResult[0].max_order) || 0) + 1;

    // Insertion en base de données
    // On utilise ${...} pour éviter les injections SQL (sécurité).
    const result = await sql`
      INSERT INTO tiles (title, description, sound_url, image_url, display_order, style_config)
      VALUES (${title}, ${description}, ${sound_url}, ${image_url}, ${nextOrder}, ${JSON.stringify(style_config)})
      RETURNING *
    `;

    // Renvoie la tuile créée avec le code 201 (Created)
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating tile:', error);
    return NextResponse.json(
      { error: 'Failed to create tile' },
      { status: 500 }
    );
  }
}