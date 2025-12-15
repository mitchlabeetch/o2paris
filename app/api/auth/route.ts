import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    try {
      const isValid = await verifyPassword(password);

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }

      // Create a secure session token using crypto
      const token = crypto.randomBytes(32).toString('base64');

      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    } catch (authError: any) {
        // If it's the "must be set in production" error, return a specific 500
        if (authError.message === 'ADMIN_PASSWORD_HASH must be set in production') {
            return NextResponse.json(
                { error: 'Server misconfiguration: Admin password not set.' },
                { status: 500 }
            );
        }
        throw authError;
    }

  } catch (error) {
    console.error('Error authenticating:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}
