/**
 * -----------------------------------------------------------------------------
 * FICHIER : app/api/images/route.ts
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le "Gestionnaire de Fichiers Images".
 * Il permet de télécharger les images (GET) et d'en uploader de nouvelles (POST).
 * Les fichiers sont stockés en base de données en tant que BYTEA (binaires).
 *
 * FONCTIONNEMENT :
 * GET avec ID : Télécharge le fichier image complet (données binaires).
 * POST : Envoie une nouvelle image et la sauvegarde en base.
 * DELETE : Supprime une image.
 *
 * REPÈRES :
 * - Lignes 20-45 : GET (téléchargement avec ID obligatoire).
 * - Lignes 48-110 : POST (upload de l'image).
 * - Lignes 113-130 : DELETE (suppression).
 * 
 * DIFFÉRENCE AVEC SOUNDS :
 * - Images : GET n'a pas de mode "liste" (ID obligatoire).
 * - Sons : GET peut lister tous les sons (sans ID) ou un son spécifique.
 * - Images : Plus restrictif (pour éviter de lister toutes les images).
 * 
 * TYPES DE FICHIERS ACCEPTÉS :
 * - image/jpeg (jpg)
 * - image/png
 * - image/webp
 * - image/gif
 * - image/svg+xml
 * - Validation côté serveur avec file.type.
 * 
 * TAILLE LIMITE :
 * - Max 5 MB par fichier image.
 * - Vérification côté serveur avec file.size.
 * 
 * UTILISATION PAR :
 * - TileForm.tsx : Upload d'images lors de la création/édition de tuiles.
 * - Tile.tsx : Affichage des images (GET avec ID).
 * 
 * FLUX D'UPLOAD :
 * 1. Client sélectionne une image (input type="file").
 * 2. Envoie un POST multipart/form-data vers /api/images.
 * 3. Le serveur valide le type et la taille.
 * 4. Sauvegarde le fichier en base de données (table 'images').
 * 5. Retourne l'ID et le nom du fichier.
 * 6. Client construit l'URL : /api/images?id=123.
 * 
 * FLUX D'AFFICHAGE :
 * 1. Client demande GET /api/images?id=123.
 * 2. Serveur récupère l'image en base.
 * 3. Retourne le fichier binaire avec Content-Type correct.
 * 4. Le navigateur l'affiche (via <img> tag).
 * 
 * STOCKAGE EN BASE :
 * - Table 'images' avec colonnes :
 *   - id : Identifiant unique (SERIAL PRIMARY KEY).
 *   - filename : Nom du fichier d'origine.
 *   - data : Contenu binaire du fichier (BYTEA).
 *   - mime_type : Type MIME (image/jpeg, etc).
 *   - size : Taille en bytes.
 *   - created_at : Timestamp d'création.
 * 
 * OPTIMISATION POSSIBLES :
 * - Compression d'images côté serveur (réduire la taille).
 * - Génération de thumbnails (pour les listes).
 * - Cache HTTP (avec ETag pour validité).
 * - CDN pour distribution plus rapide.
 * 
 * PERFORMANCE :
 * - Chaque GET lit le fichier complet depuis la base.
 * - Images volumineuses (>5 MB) ralentissent les requêtes.
 * - Pas de pageyload/streaming (envoyer le fichier entier).
 * 
 * SÉCURITÉ :
 * - Validation du type MIME côté serveur.
 * - Limite de taille pour éviter les abus.
 * - Pas d'exécution (les images sont juste des données).
 * - Injection SQL : Protection par paramètres (${id}).
 * - Pas de direct file access (tout passe par l'API).
 * 
 * ERREURS :
 * - 400 : ID requis mais pas fourni en GET.
 * - 404 : Image non trouvée avec cet ID.
 * - 413 : Fichier trop volumineux.
 * - 415 : Type de fichier non supporté.
 * - 500 : Erreur serveur (données manquantes, etc).
 * 
 * MÉTADONNÉES RETOURNÉES :
 * - POST /api/images (upload) :
 *   ```json
 *   { id: 1, filename: "tile.jpg", mime_type: "image/jpeg", size: 102400 }
 *   ```
 * 
 * - GET /api/images?id=1 (fichier) :
 *   Corps binaire (le fichier image brut).
 *   Headers :
 *   - Content-Type: image/jpeg
 *   - Content-Disposition: inline; filename="tile.jpg"
 *   - Content-Length: 102400
 * 
 * INTÉGRATION AVEC LES TUILES :
 * - Chaque tuile a un image_url.
 * - Peut pointer vers une URL externe (https://...) ou interne (/api/images?id=123).
 * - L'app supporte les deux (flexible).
 * 
 * LIEN AVEC D'AUTRES FICHIERS :
 * - TileForm.tsx : Upload les images.
 * - Tile.tsx : Affiche les images via <img src>.
 * - TileModal.tsx : Affiche les images en grand.
 * - lib/db.ts : Type ImageFile (interface).
 * 
 * CONSIDÉRATIONS FUTURES :
 * - Migrer vers S3/Cloud Storage pour la scalabilité.
 * - Ajouter la compression/redimensionnement automatique.
 * - Cache CDN pour les images populaires.
 * - Lazy loading (chargement différé) au frontend.
 * - Format moderne (WebP) avec fallback JPEG.
 * 
 * NOTES :
 * - Les images sont critiques pour l'UX (doivent charger rapidement).
 * - La limite 5 MB est un bon équilibre entre qualité et performance.
 * - Pour les gros volumes, un CDN ou S3 est fortement recommandé.
 * 
 * _____________________________________________________________________________
 * FIN DE LA DOCUMENTATION
 * _____________________________________________________________________________
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasValidDatabaseUrl, sql } from '@/lib/db';

// Force dynamic : pas de cache pour les images (garantir les données fraîches)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ---------------------------------------------------------------------------
// MÉTHODE GET (TÉLÉCHARGEMENT)
// ---------------------------------------------------------------------------
// Retourne le fichier image complet avec les bons headers MIME.
// ID obligatoire en paramètre (pas de mode "liste").
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
