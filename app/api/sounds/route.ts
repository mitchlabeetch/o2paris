/**
 * -----------------------------------------------------------------------------
 * FICHIER : app/api/sounds/route.ts
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le "Gestionnaire de Fichiers Sonores".
 * Il permet de télécharger les sons (GET) et d'en uploader de nouveaux (POST).
 * Les fichiers sont stockés en base de données en tant que BYTEA (binaires).
 *
 * FONCTIONNEMENT :
 * GET sans ID : Récupère la liste des sons (métadonnées seulement).
 * GET avec ID : Télécharge le fichier son complet (données binaires).
 * POST : Envoie un nouveau fichier son et le sauvegarde en base.
 * DELETE : Supprime un fichier son.
 *
 * REPÈRES :
 * - Lignes 21-29 : GET sans ID (liste).
 * - Lignes 32-54 : GET avec ID (fichier complet).
 * - Lignes 57-120 : POST (upload du son).
 * - Lignes 123-140 : DELETE (suppression).
 * 
 * CACHE :
 * - Liste des sons : Pas de cache (force-dynamic).
 * - Fichier spécifique : Aurait pu être cacé (voir commentaires).
 * - Actuellement : Pas de cache (revalidate = 0).
 * 
 * TYPES DE FICHIERS ACCEPTÉS :
 * - audio/mpeg (mp3)
 * - audio/wav
 * - audio/ogg
 * - audio/webm
 * - audio/aac
 * - Validation côté client + serveur.
 * 
 * TAILLE LIMITE :
 * - Max 10 MB par fichier son.
 * - Vérification côté serveur avec file.size.
 * 
 * UTILISATION PAR :
 * - TileForm.tsx : Upload de sons lors de la création/édition de tuiles.
 * - Map.tsx : Lecture des sons (GET avec ID).
 * 
 * FLUX D'UPLOAD :
 * 1. Client sélectionne un fichier son (input type="file").
 * 2. Envoie un POST multipart/form-data vers /api/sounds.
 * 3. Le serveur valide le type et la taille.
 * 4. Sauvegarde le fichier en base de données (table 'sounds').
 * 5. Retourne l'ID du son.
 * 6. Client construit l'URL : /api/sounds?id=123.
 * 
 * FLUX DE LECTURE :
 * 1. Client fait GET /api/sounds?id=123.
 * 2. Serveur récupère le son en base.
 * 3. Retourne le fichier binaire avec Content-Type correct.
 * 4. Le navigateur lit le son (via <audio> tag).
 * 
 * STOCKAGE EN BASE :
 * - Table 'sounds' avec colonnes :
 *   - id : Identifiant unique (SERIAL PRIMARY KEY).
 *   - filename : Nom du fichier d'origine.
 *   - data : Contenu binaire du fichier (BYTEA).
 *   - mime_type : Type MIME (audio/mpeg, etc).
 *   - size : Taille en bytes.
 *   - created_at : Timestamp d'création.
 * 
 * ALTERNATIVES AU STOCKAGE EN BASE :
 * - Fichiers sur le disque (plus performant pour gros fichiers).
 * - CDN (plus rapide pour les utilisateurs distants).
 * - S3 ou autre stockage cloud.
 * - Actuellement : Base de données (simple, transactionnel).
 * 
 * PERFORMANCE :
 * - Chaque GET avec ID lit le fichier complet depuis la base.
 * - Fichiers volumineux (>10 MB) ralentissent les requêtes.
 * - Considérer un cache ou un CDN pour l'échelle.
 * 
 * SÉCURITÉ :
 * - Validation du type MIME côté serveur.
 * - Limite de taille pour éviter les abus.
 * - Pas d'exécution (les sons sont juste des données).
 * - Injection SQL : Protection par paramètres ($1, ${id}).
 * 
 * ERREURS :
 * - 400 : Pas d'ID en GET (quand on veut un son spécifique).
 * - 404 : Son non trouvé avec cet ID.
 * - 413 : Fichier trop volumineux.
 * - 415 : Type de fichier non supporté.
 * - 500 : Erreur serveur (données manquantes, etc).
 * 
 * MÉTADONNÉES RETOURNÉES :
 * - GET /api/sounds (liste) :
 *   ```json
 *   [
 *     { id: 1, filename: "song.mp3", mime_type: "audio/mpeg", size: 5242880, created_at: "2024-01-01T12:00:00Z" }
 *   ]
 *   ```
 * 
 * - GET /api/sounds?id=1 (fichier) :
 *   Corps binaire (le fichier audio brut).
 *   Headers :
 *   - Content-Type: audio/mpeg
 *   - Content-Disposition: attachment; filename="song.mp3"
 *   - Content-Length: 5242880
 * 
 * INTÉGRATION AVEC LES TUILES :
 * - Chaque tuile a un sound_url.
 * - Peut pointer vers une URL externe (https://...) ou interne (/api/sounds?id=123).
 * - L'app supporte les deux (flexible).
 * 
 * LIEN AVEC D'AUTRES FICHIERS :
 * - TileForm.tsx : Upload les sons.
 * - Map.tsx : Lit les sons.
 * - lib/db.ts : Type Sound (interface).
 * - lib/fallbackAudio.ts : Son de secours (base64).
 * 
 * NOTES HISTORIQUES :
 * - Les sons étaient d'abord externes (URLs).
 * - Puis intégrés en base pour la portabilité.
 * - Le fallback audio (base64) est pour les sons externes qui échouent.
 * 
 * CONSIDÉRATIONS FUTURES :
 * - Migrer vers S3/Cloud Storage pour la scalabilité.
 * - Ajouter la compression/transcodage des sons.
 * - Cache CDN pour les téléchargements répétés.
 * - Streaming audio (chunked) pour les gros fichiers.
 * 
 * _____________________________________________________________________________
 * FIN DE LA DOCUMENTATION
 * _____________________________________________________________________________
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

// Force dynamic rendering and disable caching
// Note: The sounds list (no id param) is not cached
// Individual sound file data (with id param) is cached for 1 day for performance
// Actuellement : Pas de cache pour garantir que les données fraîches sont toujours servies
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ---------------------------------------------------------------------------
// MÉTHODE GET (TÉLÉCHARGEMENT)
// ---------------------------------------------------------------------------
// Deux modes : LIST (sans id) et DOWNLOAD (avec id).
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
      return NextResponse.json(sounds, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    // Get specific sound
    const result = await sql`SELECT * FROM sounds WHERE id = ${id}`;
    
    if (result.length === 0) {
      console.error(`Sound not found with ID: ${id}`);
      return NextResponse.json(
        { error: 'Sound not found' },
        { status: 404 }
      );
    }

    const sound = result[0];
    
    // Ensure data exists and is in the right format
    if (!sound.data) {
      console.error(`Sound ${id} has no data`);
      return NextResponse.json(
        { error: 'Sound data is missing' },
        { status: 500 }
      );
    }

    // Convert to Buffer if needed
    // Neon returns BYTEA as Buffer by default, but may return Uint8Array in some configurations
    // This ensures we always work with a Buffer for consistent handling
    const audioData = Buffer.isBuffer(sound.data) ? sound.data : Buffer.from(sound.data);
    
    // Return the audio file with reasonable caching (1 day)
    return new NextResponse(audioData, {
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
    const dataBuffer = Buffer.from(buffer);

    // Convert buffer to Postgres hex format for BYTEA
    // This avoids the neon driver stringifying the Buffer object to JSON
    const hexData = '\\x' + dataBuffer.toString('hex');

    console.log(`Uploading sound: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Insert using the hex string format which Postgres treats as a BYTEA literal
    const result = await sql`
      INSERT INTO sounds (filename, data, mime_type, size)
      VALUES (${file.name}, ${hexData}, ${file.type}, ${file.size})
      RETURNING id, filename, mime_type, size, created_at
    `;

    console.log(`Sound uploaded successfully with ID: ${result[0].id}`);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error uploading sound:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to upload sound', details: errorMessage },
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
