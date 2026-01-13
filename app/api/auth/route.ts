/**
 * FICHIER : app/api/auth/route.ts
 * RÔLE : Authentification générale avec gestion de tokens sécurisés.
 * POST : Vérifie le mot de passe et crée un cookie de session sécurisé.
 * DELETE : Supprime le cookie de session (déconnexion).
 * Token : Généré via crypto.randomBytes(32) - base64.
 * Stockage : Cookie httpOnly, secure, sameSite: strict.
 * Durée : 24 heures (maxAge).
 * Sécurité : httpOnly empêche l'accès JS ; secure en production.
 * Comparaison : /api/auth/login/route.ts (simpler, sans token).
 * _____________________________________________________________________________
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const isValid = await verifyPassword(password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create a secure session token using crypto
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('base64');

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
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
