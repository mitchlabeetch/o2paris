import { NextResponse } from 'next/server';
import { SEED_PINPOINTS, hasValidDatabaseUrl, initDatabase } from '@/lib/db';

export async function GET() {
  try {
    if (!hasValidDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL manquante. Renseignez-la avant d’initialiser la base.' },
        { status: 503 }
      );
    }

    await initDatabase();
    return NextResponse.json({ 
      message: 'Database initialized successfully with sample data',
      seededPinpoints: SEED_PINPOINTS.length,
      success: true 
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    );
  }
}
