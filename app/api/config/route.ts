import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_MAP_CONFIG, hasValidDatabaseUrl, sql } from '@/lib/db';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export async function PUT(request: NextRequest) {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante. Initialisez la base avec /api/init.' },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Fetch current configuration to allow partial updates
    const currentConfigRows = await sql`SELECT * FROM map_config ORDER BY id DESC LIMIT 1`;
    const currentConfig = currentConfigRows.length > 0 ? currentConfigRows[0] : DEFAULT_MAP_CONFIG;

    // Merge body with current config.
    // Use body value if present (and not null/undefined), else use current config.
    // We treat null/undefined in body as "do not update".
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
