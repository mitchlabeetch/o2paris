/**
 * -----------------------------------------------------------------------------
 * FICHIER : app/api/config/route.ts
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le "tableau de bord" du site. Cette API permet de lire ET modifier
 * la configuration globale (titre, couleurs, thème, paramètres de carte).
 *
 * FONCTIONNEMENT :
 * - GET  : Récupère la configuration actuelle de la base de données.
 * - PUT  : Met à jour la configuration (utilisé par l'admin).
 * - Elle supporte les "partial updates" : on peut changer juste une couleur
 *   sans perdre les autres paramètres.
 *
 * REPÈRES :
 * - Lignes 17-47 : Fonction GET (Lecture simple).
 * - Lignes 49-159 : Fonction PUT (Mise à jour avec fusion intelligente).
 * - Lignes 67-92  : Logique de fusion (merge) entre ancienne et nouvelle config.
 * - Lignes 82-91  : Conversion et validation des nombres.
 * - Lignes 110-126: Insertion si la config n'existe pas.
 * - Lignes 128-150: Mise à jour si la config existe.
 * -----------------------------------------------------------------------------
 */

import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_MAP_CONFIG, hasValidDatabaseUrl, sql } from '@/lib/db';

// Force dynamic rendering and disable caching
// Cette API doit TOUJOURS renvoyer les données fraîches, jamais du cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ---------------------------------------------------------------------------
// MÉTHODE GET (LECTURE)
// ---------------------------------------------------------------------------
// Appelée quand le frontend demande la config actuelle
export async function GET() {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { ...DEFAULT_MAP_CONFIG },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        }
      );
    }

    const configs = await sql`SELECT * FROM map_config ORDER BY id DESC LIMIT 1`;
    
    if (configs.length === 0) {
      // Return default config
      return NextResponse.json(
        { ...DEFAULT_MAP_CONFIG },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        }
      );
    }

    return NextResponse.json(configs[0], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// MÉTHODE PUT (MISE À JOUR)
// ---------------------------------------------------------------------------
// Appelée quand l'admin sauvegarde la configuration via le formulaire
export async function PUT(request: NextRequest) {
   try {
     if (!hasValidDatabaseUrl) {
       return NextResponse.json(
         { error: 'DATABASE_URL manquante. Initialisez la base avec /api/init.' },
         { status: 503 }
       );
     }

     const body = await request.json();

     // ---------------------------------------------------------------------------
     // FUSION INTELLIGENTE (MERGE)
     // ---------------------------------------------------------------------------
     // On récupère la config existante pour ne pas perdre les champs non envoyés
     const currentConfigRows = await sql`SELECT * FROM map_config ORDER BY id DESC LIMIT 1`;
     const currentConfig = currentConfigRows.length > 0 ? currentConfigRows[0] : DEFAULT_MAP_CONFIG;

     // Stratégie : Si le body contient une valeur (non vide, non null), on l'utilise.
     // Sinon, on garde la valeur actuelle. Cela permet les mises à jour partielles.
     // Exemple : envoyer juste { "app_title": "Nouveau titre" } ne change que le titre.
    const getValue = (key: string, current: any) => {
      return body[key] !== undefined && body[key] !== null ? body[key] : current;
    };

    const tile_layer_url = getValue('tile_layer_url', currentConfig.tile_layer_url);
    const attribution = getValue('attribution', currentConfig.attribution);
    const background_theme = getValue('background_theme', currentConfig.background_theme);
    const app_title = getValue('app_title', currentConfig.app_title);
    const app_subtitle = getValue('app_subtitle', currentConfig.app_subtitle);
    const overlay_icon = getValue('overlay_icon', currentConfig.overlay_icon);
    const font_family = getValue('font_family', currentConfig.font_family);
    const primary_color = getValue('primary_color', currentConfig.primary_color);
    const secondary_color = getValue('secondary_color', currentConfig.secondary_color);

    // Numeric fields need special handling because they might be strings in body OR currentConfig (if from DB)
    const getNumericValue = (key: string, current: any) => {
      const val = body[key] !== undefined && body[key] !== null ? body[key] : current;
      return Number(val);
    };

    const centerLatNum = getNumericValue('center_lat', currentConfig.center_lat);
    const centerLngNum = getNumericValue('center_lng', currentConfig.center_lng);
    const zoomLevelNum = getNumericValue('zoom_level', currentConfig.zoom_level);
    const maxZoomNum = getNumericValue('max_zoom', currentConfig.max_zoom);
    const minZoomNum = getNumericValue('min_zoom', currentConfig.min_zoom);

    // Validate required numeric fields
    const numericFields = [centerLatNum, centerLngNum, zoomLevelNum, maxZoomNum, minZoomNum];
    if (!numericFields.every(field => typeof field === 'number' && !isNaN(field))) {
      return NextResponse.json(
        { error: 'Invalid configuration: All numeric fields must have valid values' },
        { status: 400 }
      );
    }

    // Validate tile_layer_url is not empty
    if (!tile_layer_url?.trim()) {
      return NextResponse.json(
        { error: 'Invalid configuration: Tile layer URL is required' },
        { status: 400 }
      );
    }

    if (currentConfigRows.length === 0) {
      // Insert new config
      const result = await sql`
        INSERT INTO map_config (
          tile_layer_url, center_lat, center_lng, zoom_level, max_zoom, min_zoom, attribution, 
          background_theme, app_title, app_subtitle, overlay_icon, font_family, primary_color, secondary_color
        )
        VALUES (
          ${tile_layer_url}, ${centerLatNum}, ${centerLngNum}, ${zoomLevelNum}, ${maxZoomNum}, ${minZoomNum}, 
          ${attribution || ''}, ${background_theme || 'water'}, ${app_title || 'Eau de Paris'}, 
          ${app_subtitle || 'Une expérience sonore et visuelle'}, ${overlay_icon || '💧'}, 
          ${font_family || 'Playfair Display'}, ${primary_color || '#2196f3'}, ${secondary_color || '#1565c0'}
        )
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    }

    // Update existing config
    const result = await sql`
      UPDATE map_config
      SET 
        tile_layer_url = ${tile_layer_url},
        center_lat = ${centerLatNum},
        center_lng = ${centerLngNum},
        zoom_level = ${zoomLevelNum},
        max_zoom = ${maxZoomNum},
        min_zoom = ${minZoomNum},
        attribution = ${attribution || ''},
        background_theme = ${background_theme || 'water'},
        app_title = ${app_title || 'Eau de Paris'},
        app_subtitle = ${app_subtitle || 'Une expérience sonore et visuelle'},
        overlay_icon = ${overlay_icon || '💧'},
        font_family = ${font_family || 'Playfair Display'},
        primary_color = ${primary_color || '#2196f3'},
        secondary_color = ${secondary_color || '#1565c0'},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${currentConfigRows[0].id}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
