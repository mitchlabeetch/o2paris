/**
 * -----------------------------------------------------------------------------
 * FICHIER : app/api/init/route.ts
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est le "Constructeur" de la base de données.
 * Elle crée toutes les tables et insère les données d'exemple au premier lancement.
 *
 * FONCTIONNEMENT :
 * 1. Vérifie que DATABASE_URL est configuré.
 * 2. Appelle initDatabase() qui crée toutes les tables PostgreSQL.
 * 3. Peuple les tables avec des données d'exemple (seed data).
 * 4. Retourne un rapport du résultat.
 *
 * UTILISÉ PAR :
 * - Démarrage initial du projet (une seule fois).
 * - Script de réinitialisation : `curl http://localhost:3000/api/init`
 *
 * REPÈRES :
 * - Lignes 17 : initDatabase() - Crée les tables (voir lib/db.ts).
 * - Lignes 18-23 : Réponse de succès avec infos.
 * 
 * SÉCURITÉ :
 * - Endpoint sans authentification (devrait être protégé en production).
 * - À considérer : ajouter une clé d'API ou un token.
 * 
 * FLUX D'INITIALISATION :
 * 1. Les tables sont créées par initDatabase() (CREATE TABLE IF NOT EXISTS).
 * 2. Les données de seed sont insérées seulement si les tables sont vides.
 * 3. Permet de réappeler sans danger (idempotent).
 * - If table not empty: Les données ne sont pas doublées.
 * 
 * TABLES CRÉÉES (voir lib/db.ts pour détails) :
 * - pinpoints : Points d'intérêt sur la carte (legacy).
 * - tiles : Tuiles d'images pour la grille principale.
 * - map_config : Configuration globale de l'app.
 * - sounds : Fichiers audio stockés.
 * - images : Fichiers image stockés.
 * - custom_icons : Icônes personnalisées.
 * - custom_backgrounds : Fonds d'écran personnalisés.
 * 
 * DONNÉES DE SEED :
 * - 10 pinpoints d'exemple (lieux parisiens).
 * - 10 tuiles d'exemple (monuments, paysages).
 * - 1 configuration par défaut.
 * - Voir lib/db.ts lignes 450-530 pour les données exactes.
 * 
 * RÉPONSE EN CAS DE SUCCÈS :
 * ```json
 * {
 *   "message": "Database initialized successfully...",
 *   "seededPinpoints": 10,
 *   "success": true
 * }
 * ```
 * 
 * RÉPONSE EN CAS D'ERREUR :
 * - 503 : DATABASE_URL manquant.
 * - 500 : Erreur de création de table (permissions, connexion, etc).
 * 
 * AMÉLIORATIONS FUTURES :
 * - Protéger cet endpoint (clé d'API ou middleware auth).
 * - Permettre une réinitialisation complète (reset) avec confirmation.
 * - Ajouter des options (--seed-data, --skip-seed).
 * - Logging détaillé (quelles tables, quelles données).
 * 
 * NOTES :
 * - Cette route doit être appelée UNE SEULE FOIS.
 * - En production, utiliser un script de migration dédié.
 * - Ne jamais laisser accessible publiquement.
 * 
 * COMMANDES :
 * Dev : `curl http://localhost:3000/api/init`
 * Prod : `curl https://your-domain.com/api/init` (avec auth)
 * 
 * _____________________________________________________________________________
 * FIN DE LA DOCUMENTATION
 * _____________________________________________________________________________
 */

import { NextResponse } from 'next/server';
import { SEED_PINPOINTS, hasValidDatabaseUrl, initDatabase } from '@/lib/db';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ---------------------------------------------------------------------------
// MÉTHODE GET (INITIALISATION)
// ---------------------------------------------------------------------------
// Crée les tables et peuple avec les données de seed.
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
      message: 'Database initialized successfully. Tables created and sample data seeded if empty.',
      info: 'Note: This endpoint only seeds data if tables are empty to prevent duplicates.',
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
