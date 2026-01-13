/**
 * -----------------------------------------------------------------------------
 * FICHIER : app/api/auth/login/route.ts
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le "Videur" de la partie administration.
 * Il reçoit les tentatives de connexion et valide l'accès.
 *
 * FONCTIONNEMENT :
 * 1. Reçoit le mot de passe via une requête POST.
 * 2. Le compare à la variable d'environnement ou au mot de passe par défaut.
 * 3. Renvoie un succès (true) ou une erreur (401).
 * -----------------------------------------------------------------------------
 */

import { NextRequest, NextResponse } from 'next/server';

// On force le mode dynamique pour éviter que Next.js ne mette en cache la réponse
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Lecture du mot de passe envoyé par le formulaire
    const { password } = await request.json();

    // Récupération du mot de passe valide (Priorité variable d'env, sinon défaut)
    const validPassword = process.env.ADMIN_PASSWORD || 'Admin123';

    if (password === validPassword) {
      // Connexion réussie
      return NextResponse.json({ success: true });
    } else {
      // Mot de passe incorrect
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    // Erreur technique (ex: JSON mal formé)
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}