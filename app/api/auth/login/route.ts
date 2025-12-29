import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // In a real app, use a hash. For this project context, we fallback to env or default.
    // The user specified to maintain backend elements.
    const validPassword = process.env.ADMIN_PASSWORD || 'Admin123';

    if (password === validPassword) {
      // Return a simple success. In production, Set-Cookie header for HttpOnly cookie.
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
