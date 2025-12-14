import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_MAP_CONFIG, hasValidDatabaseUrl, sql } from '@/lib/db';

export async function GET() {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json({
        ...DEFAULT_MAP_CONFIG,
      });
    }

    const configs = await sql`SELECT * FROM map_config ORDER BY id DESC LIMIT 1`;
    
    if (configs.length === 0) {
      // Return default config
      return NextResponse.json({
        ...DEFAULT_MAP_CONFIG,
      });
    }

    return NextResponse.json(configs[0]);
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
    const body = await request.json();
    const { tile_layer_url, center_lat, center_lng, zoom_level, max_zoom, min_zoom, attribution } = body;

    // Get the current config ID
    const currentConfig = await sql`SELECT id FROM map_config ORDER BY id DESC LIMIT 1`;
    
    if (currentConfig.length === 0) {
      // Insert new config
      const result = await sql`
        INSERT INTO map_config (tile_layer_url, center_lat, center_lng, zoom_level, max_zoom, min_zoom, attribution)
        VALUES (${tile_layer_url}, ${center_lat}, ${center_lng}, ${zoom_level}, ${max_zoom}, ${min_zoom}, ${attribution})
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    }

    // Update existing config
    const result = await sql`
      UPDATE map_config
      SET 
        tile_layer_url = ${tile_layer_url},
        center_lat = ${center_lat},
        center_lng = ${center_lng},
        zoom_level = ${zoom_level},
        max_zoom = ${max_zoom},
        min_zoom = ${min_zoom},
        attribution = ${attribution},
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
