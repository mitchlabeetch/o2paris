import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({ 
      message: 'Database initialized successfully',
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
