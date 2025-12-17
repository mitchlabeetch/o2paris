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
    const { tile_layer_url, center_lat, center_lng, zoom_level, max_zoom, min_zoom, attribution, background_theme } = body;

    // Convert inputs to numbers
    // This handles cases where database returns decimals as strings (e.g. "48.8566")
    // and they are sent back as strings if not modified in the frontend
    const centerLatNum = Number(center_lat);
    const centerLngNum = Number(center_lng);
    const zoomLevelNum = Number(zoom_level);
    const maxZoomNum = Number(max_zoom);
    const minZoomNum = Number(min_zoom);

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

    // Get the current config ID
    const currentConfig = await sql`SELECT id FROM map_config ORDER BY id DESC LIMIT 1`;
    
    if (currentConfig.length === 0) {
      // Insert new config
      const result = await sql`
        INSERT INTO map_config (tile_layer_url, center_lat, center_lng, zoom_level, max_zoom, min_zoom, attribution, background_theme)
        VALUES (${tile_layer_url}, ${centerLatNum}, ${centerLngNum}, ${zoomLevelNum}, ${maxZoomNum}, ${minZoomNum}, ${attribution || ''}, ${background_theme || 'water'})
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
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${currentConfig[0].id}
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
