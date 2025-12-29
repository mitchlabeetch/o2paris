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

    // Process reordering in a transaction-like manner
    // Since neon serverless http doesn't support complex transactions easily in simple mode,
    // we'll execute updates sequentially.
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      await sql`UPDATE tiles SET display_order = ${i + 1} WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering tiles:', error);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
