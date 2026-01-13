/**
 * -----------------------------------------------------------------------------
 * FICHIER : lib/auth.ts
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le "Code de la Route" de la sécurité.
 * Il contient la logique pure pour vérifier si un mot de passe est valide.
 *
 * FONCTIONNEMENT :
 * - En développement : accepte 'Admin123' si aucune variable n'est définie.
 * - En production : exige absolument la variable ADMIN_PASSWORD.
 * -----------------------------------------------------------------------------
 */

export async function verifyPassword(password: string): Promise<boolean> {
  // Récupération du mot de passe admin (avec nettoyage des espaces)
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  
  // 1. Cas particulier : Développement (fallback si variable absente)
  if (!adminPassword && process.env.NODE_ENV !== 'production') {
    return password === 'Admin123';
  }
  
  // 2. Sécurité Production : On bloque tout si le mot de passe n'est pas configuré
  if (!adminPassword && process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD must be set in production');
  }
  
  // 3. Comparaison finale
  return password === adminPassword;
}