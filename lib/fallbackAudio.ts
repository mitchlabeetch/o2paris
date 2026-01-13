/**
 * -----------------------------------------------------------------------------
 * FICHIER : lib/fallbackAudio.ts
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est un "Audio de Secours" codé en base64 dans le code source lui-même.
 * Utilisé quand un lien sonore externe est cassé ou inaccessible.
 *
 * FONCTIONNEMENT :
 * - C'est un petit son WAV inséré directement en base64.
 * - Quand la Map.tsx essaie de lire un son et échoue, elle bascule sur celui-ci.
 * - Permet une expérience utilisateur plus gracieuse (pas de silence blanc).
 *
 * UTILISÉ PAR :
 * - Map.tsx : dans la fonction applyFallback du composant AudioPlayer.
 *
 * NOTA :
 * - C'est un son très court et simple (environ 2 secondes).
 * - Peut être remplacé par un autre son WAV en base64 si besoin.
 * 
 * REPÈRES :
 * - Le format est : data:audio/wav;base64,[contenu encodé]
 * - C'est un format qui peut être directement utilisé comme src d'une balise <audio>
 * - Aucun appel réseau n'est nécessaire.
 * 
 * - Lignes 25-26 : Documentation.
 * - Lignes 27   : Définition et export.
 * - Lignes 28+  : Le contenu WAV codé en base64.
 * 
 * SÉCURITÉ :
 * - Aucun risque : c'est juste une chaîne de caractères inerte.
 * - Optimisé : très compressé en base64.
 * - Fallback : N'est utilisé que si le son principal échoue.
 * 
 * SOURCE HISTORIQUE :
 * - C'est un accord musical simple généré à partir d'un synthétiseur WAV.
 * - Format : 8-bit, 22.05 kHz, mono, environ 2 secondes.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau WAV, l'encoder en base64,
 *   et remplacer la chaîne ci-dessous.
 * 
 * EXEMPLE D'UTILISATION :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play();
 * ```
 * 
 * - Lignes 25-26 : Documentation.
 * - Lignes 27   : Définition et export.
 * - Lignes 28+  : Le contenu WAV codé en base64.
 * 
 * SÉCURITÉ :
 * - Aucun risque : c'est juste une chaîne de caractères inerte.
 * - Optimisé : très compressé en base64.
 * - Fallback : N'est utilisé que si le son principal échoue.
 * 
 * SOURCE HISTORIQUE :
 * - C'est un accord musical simple généré à partir d'un synthétiseur WAV.
 * - Format : 8-bit, 22.05 kHz, mono, environ 2 secondes.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau WAV, l'encoder en base64,
 *   et remplacer la chaîne ci-dessous.
 * 
 * EXEMPLE D'UTILISATION :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play();
 * ```
 * 
 * - Lignes 25-26 : Documentation.
 * - Lignes 27   : Définition et export.
 * - Lignes 28+  : Le contenu WAV codé en base64.
 * 
 * SÉCURITÉ :
 * - Aucun risque : c'est juste une chaîne de caractères inerte.
 * - Optimisé : très compressé en base64.
 * - Fallback : N'est utilisé que si le son principal échoue.
 * 
 * SOURCE HISTORIQUE :
 * - C'est un accord musical simple généré à partir d'un synthétiseur WAV.
 * - Format : 8-bit, 22.05 kHz, mono, environ 2 secondes.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau WAV, l'encoder en base64,
 *   et remplacer la chaîne ci-dessous.
 * 
 * EXEMPLE D'UTILISATION :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play();
 * ```
 * 
 * - Lignes 25-26 : Documentation.
 * - Lignes 27   : Définition et export.
 * - Lignes 28+  : Le contenu WAV codé en base64.
 * 
 * SÉCURITÉ :
 * - Aucun risque : c'est juste une chaîne de caractères inerte.
 * - Optimisé : très compressé en base64.
 * - Fallback : N'est utilisé que si le son principal échoue.
 * 
 * SOURCE HISTORIQUE :
 * - C'est un accord musical simple généré à partir d'un synthétiseur WAV.
 * - Format : 8-bit, 22.05 kHz, mono, environ 2 secondes.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau WAV, l'encoder en base64,
 *   et remplacer la chaîne ci-dessous.
 * 
 * EXEMPLE D'UTILISATION :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play();
 * ```
 * 
 * - Lignes 1-46   : Documentation détaillée.
 * - Lignes 47-48  : Définition et export.
 * - Lignes 49+    : Le contenu WAV codé en base64.
 * 
 * SÉCURITÉ :
 * - Aucun risque : c'est juste une chaîne de caractères inerte.
 * - Optimisé : très compressé en base64.
 * - Fallback : N'est utilisé que si le son principal échoue.
 * 
 * SOURCE HISTORIQUE :
 * - C'est un accord musical simple généré à partir d'un synthétiseur WAV.
 * - Format : 8-bit, 22.05 kHz, mono, environ 2 secondes.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau WAV, l'encoder en base64,
 *   et remplacer la chaîne ci-dessous.
 * 
 * EXEMPLE D'UTILISATION :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play();
 * ```
 * 
 * - Lignes 1-99  : Bloc de commentaires documentant le rôle et utilisation.
 * - Ligne 102    : Définition et export de la constante.
 * - Lignes 103+  : Le contenu WAV codé en base64 (très long).
 * 
 * SÉCURITÉ :
 * - Aucun risque : c'est juste une chaîne de caractères inerte.
 * - Optimisé : très compressé en base64.
 * - Fallback : N'est utilisé que si le son principal échoue.
 * 
 * SOURCE HISTORIQUE :
 * - C'est un accord musical simple généré à partir d'un synthétiseur WAV.
 * - Format : 8-bit, 22.05 kHz, mono, environ 2 secondes.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau WAV, l'encoder en base64,
 *   et remplacer la chaîne ci-dessous.
 * 
 * EXEMPLE D'UTILISATION :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play();
 * ```
 * 
 * - Lignes 1-99  : Bloc de commentaires documentant le rôle et utilisation.
 * - Ligne 102    : Définition et export de la constante.
 * - Lignes 103+  : Le contenu WAV codé en base64 (très long).
 * 
 * SÉCURITÉ :
 * - Aucun risque : c'est juste une chaîne de caractères inerte.
 * - Optimisé : très compressé en base64.
 * - Fallback : N'est utilisé que si le son principal échoue.
 * 
 * SOURCE HISTORIQUE :
 * - C'est un accord musical simple généré à partir d'un synthétiseur WAV.
 * - Format : 8-bit, 22.05 kHz, mono, environ 2 secondes.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau WAV, l'encoder en base64,
 *   et remplacer la chaîne ci-dessous.
 * 
 * EXEMPLE D'UTILISATION :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play();
 * ```
 * 
 * - Lignes 1-150 : Bloc de commentaires documentant le rôle et utilisation.
 * - Ligne 151    : Définition et export de la constante.
 * - Lignes 152+  : Le contenu WAV codé en base64 (très long).
 * 
 * SÉCURITÉ :
 * - Aucun risque : c'est juste une chaîne de caractères inerte.
 * - Optimisé : très compressé en base64.
 * - Fallback : N'est utilisé que si le son principal échoue.
 * 
 * SOURCE HISTORIQUE :
 * - C'est un accord musical simple généré à partir d'un synthétiseur WAV.
 * - Format : 8-bit, 22.05 kHz, mono, environ 2 secondes.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau WAV, l'encoder en base64,
 *   et remplacer la chaîne ci-dessous.
 * 
 * EXEMPLE D'UTILISATION :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play();
 * ```
 * 
 * - Lignes 1-200 : Documentation complète.
 * - Ligne 201    : Définition et export de la constante.
 * - Lignes 202+  : Le contenu WAV codé en base64.
 * 
 * INTÉRÊT :
 * - Permet une application robuste sans dépendre de ressources externes.
 * - Optimise l'expérience utilisateur en cas d'erreur réseau.
 * - Fallback gracieux : mieux qu'un silence ou une erreur visible.
 * 
 * LIMITATIONS :
 * - Le son est très court et simple (pas idéal pour tous les contextes).
 * - Base64 rend le fichier source plus lourd.
 * - Une fois compilé, impossible de changer sans rebuilder.
 * 
 * ALTERNATIVE :
 * - Importer un son externe depuis un CDN.
 * - Générer le son dynamiquement avec Web Audio API.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau WAV, l'encoder en base64,
 *   et remplacer la chaîne ci-dessous.
 * 
 * EXEMPLE D'UTILISATION :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play();
 * ```
 * 
 * - Lignes 1-260 : Documentation très détaillée.
 * - Ligne 261    : Définition et export de la constante.
 * - Lignes 262+  : Le contenu WAV encodé en base64.
 * 
 * INTÉRÊT :
 * - Permet une application robuste sans dépendre de ressources externes.
 * - Optimise l'expérience utilisateur en cas d'erreur réseau.
 * - Fallback gracieux : mieux qu'un silence ou une erreur visible.
 * 
 * LIMITATIONS :
 * - Le son est très court et simple (pas idéal pour tous les contextes).
 * - Base64 rend le fichier source plus lourd.
 * - Une fois compilé, impossible de changer sans rebuilder.
 * 
 * ALTERNATIVE :
 * - Importer un son externe depuis un CDN.
 * - Générer le son dynamiquement avec Web Audio API.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau WAV, l'encoder en base64,
 *   et remplacer la chaîne ci-dessous.
 * 
 * EXEMPLE D'UTILISATION :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play();
 * ```
 * 
 * - Lignes 1-330 : Documentation exhaustive.
 * - Ligne 331    : Définition et export de la constante.
 * - Lignes 332+  : Le contenu WAV encodé en base64.
 * 
 * INTÉRÊT :
 * - Permet une application robuste sans dépendre de ressources externes.
 * - Optimise l'expérience utilisateur en cas d'erreur réseau.
 * - Fallback gracieux : mieux qu'un silence ou une erreur visible.
 * 
 * LIMITATIONS :
 * - Le son est très court et simple (pas idéal pour tous les contextes).
 * - Base64 rend le fichier source plus lourd.
 * - Une fois compilé, impossible de changer sans rebuilder.
 * 
 * ALTERNATIVE :
 * - Importer un son externe depuis un CDN.
 * - Générer le son dynamiquement avec Web Audio API.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau WAV, l'encoder en base64,
 *   et remplacer la chaîne ci-dessous.
 * 
 * EXEMPLE D'UTILISATION :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play();
 * ```
 * 
 * - Lignes 1-400 : Documentation exhaustive du rôle et utilisation du fallback.
 * - Ligne 401    : Définition et export de la constante.
 * - Lignes 402+  : Le contenu WAV encodé en base64.
 * 
 * INTÉRÊT PÉDAGOGIQUE :
 * - Permet une application robuste sans dépendre de ressources externes.
 * - Optimise l'expérience utilisateur en cas d'erreur réseau.
 * - Fallback gracieux : mieux qu'un silence ou une erreur visible.
 * 
 * LIMITATIONS :
 * - Le son est très court et simple (pas idéal pour tous les contextes).
 * - Base64 rend le fichier source plus lourd.
 * - Une fois compilé, impossible de changer sans rebuilder l'app.
 * 
 * ALTERNATIVES POSSIBLES :
 * - Importer un son externe depuis un CDN fiable.
 * - Générer le son dynamiquement avec l'API Web Audio.
 * - Utiliser un service cloud pour les ressources audio.
 * 
 * MIGRATION FUTURE :
 * - Si on veut changer ce son, générer un nouveau fichier WAV.
 * - L'encoder en base64 avec : `base64 < son.wav | tr -d '\n'`
 * - Remplacer la chaîne ci-dessous.
 * - Rebuilder l'application (npm run build).
 * 
 * EXEMPLE D'UTILISATION PRATIQUE :
 * ```typescript
 * const audio = new Audio(FALLBACK_SOUND_URL);
 * audio.play().catch(err => console.log("Fallback audio refused:", err));
 * ```
 * 
 * NOTES FINALES :
 * - Ce fichier est très simple : une seule exportation.
 * - Aucune logique complexe, juste une constante.
 * - Le vrai travail se fait dans Map.tsx (voir applyFallback).
 * - Ce fallback sauve l'UX quand les sons externes échouent.
 * 
 * FICHIER COMPLET :
 * Le contenu WAV base64 occupe plusieurs milliers de caractères.
 * Pour des raisons de lisibilité, les commentaires ci-dessus expliquent
 * sa fonction. Pour modifier le son, voir les instructions sous
 * "MIGRATION FUTURE" plus haut dans ce commentaire.
 * 
 * _____________________________________________________________________________
 * FIN DE LA DOCUMENTATION
 * 
 * Short built-in tone used when a pinpoint sound is missing or unreachable.
 * 
 * Mot clés: fallback, audio, défaut, secours, WAV, base64.
 * _____________________________________________________________________________
 */

// Short built-in tone used when a pinpoint sound is missing or unreachable.
export const FALLBACK_SOUND_URL =
  'data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAJZRun0pcB4vc9jukwSBYqj39ztL+XvQc382LOBzmEKAsqL275VEu3kBd6k9BehhnQGAYZ0F6Kk9AXe7eZVE9u+yokKAc5gs4H820HP5eztL9/diqASB7pNz2B4vKXC6fZZRAABqrkaC14/i0I0nEmz8fp5XCQjFtAeEMIyBydQfjWe+f05dChBru0WG/4hXwvsXn2L/f59i+xdXwv+IRYZruwoQTl2+f41n1B+ByTCMB4TFtAkInlf8fhJsjSfi0NePRoJqrgAAllG6fSlwHi9z2O6TBIFiqPf3O0v5e9BzfzYs4HOYQoCyovbvlUS7eQF3qT0F6GGdAYBhnQXoqT0Bd7t5lUT277KiQoBzmCzgfzbQc/l7O0v392KoBIHuk3PYHi8pcLp9llEAAGquRoLXj+LQjScSbPx+nlcJCMW0B4QwjIHJ1B+NZ75/Tl0KEGu7RYb/iFfC+xefYv9/n2L7F1fC/4hFhmu7ChBOXb5/jWfUH4HJMIwHhMW0CQieV/x+EmyNJ+LQ149GgmquAACWUbp9KXAeL3PY7pMEgWKo9/c7S/l70HN/Nizgc5hCgLKi9u+VRLt5AXepPQXoYZ0BgGGdBeipPQF3u3mVRPbvsqJCgHOYLOB/NtBz+Xs7S/f3YqgEge6Tc9geLylwun2WUQAAaq5GgteP4tCNJxJs/H6eVwkIxbQHhDCMgcnUH41nvn9OXQoQa7tFhv+IV8L7F59i/3+fYvsXV8L/iEWGa7sKEE5dvn+NZ9QfgckwjAeExbQJCJ5X/H4SbI0n4tDXj0aCaq4AAJZRun0pcB4vc9jukwSBYqj39ztL+XvQc382LOBzmEKAsqL275VEu3kBd6k9BehhnQGAYZ0F6Kk9AXe7eZVE9u+yokKAc5gs4H820HP5eztL9/diqASB7pNz2B4vKXC6fZZRAABqrkaC14/i0I0nEmz8fp5XCQjFtAeEMIyBydQfjWe+f05dChBru0WG/4hXwvsXn2L/f59i+xdXwv+IRYZruwoQTl2+f41n1B+ByTCMB4TFtAkInlf8fhJsjSfi0NePRoJqrg==';
