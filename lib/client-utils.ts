/**
 * -----------------------------------------------------------------------------
 * FICHIER : lib/client-utils.ts
 * -----------------------------------------------------------------------------
 * RÔLE :
 * C'est la boîte à outils du navigateur ("Le Couteau Suisse").
 * Elle contient des petites fonctions pratiques utilisées par les composants React.
 *
 * FONCTIONNEMENT :
 * Ce sont des "fonctions pures" : elles prennent une entrée, font un calcul,
 * et renvoient un résultat sans modifier l'état global.
 *
 * REPÈRES :
 * - Lignes 18-24 : Lecture de cookies (utilisé pour l'authentification).
 * - Lignes 30-38 : Mélange simple d'un tableau.
 * - Lignes 48+   : Mélange "intelligent" pour éviter que deux images identiques se suivent.
 * -----------------------------------------------------------------------------
 */

// -----------------------------------------------------------------------------
// GESTION DES COOKIES
// -----------------------------------------------------------------------------
// Récupère la valeur d'un cookie par son nom.
// Utile pour vérifier si l'utilisateur est connecté (token 'admin_session').
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null; // Sécurité : ne rien faire si on est sur le serveur
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// -----------------------------------------------------------------------------
// MÉLANGE ALÉATOIRE SIMPLE
// -----------------------------------------------------------------------------
// Utilise l'algorithme de Fisher-Yates (le standard pour mélanger des cartes).
// Renvoie une COPIE du tableau mélangé (ne modifie pas l'original).
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// -----------------------------------------------------------------------------
// MÉLANGE INTELLIGENT (ANTI-DOUBLONS)
// -----------------------------------------------------------------------------
// C'est une version avancée du mélangeur.
// PROBLÈME : Si on a peu de tuiles, le hasard peut mettre deux fois la même image côte à côte.
// SOLUTION : On mélange, puis on parcourt le résultat pour corriger les doublons adjacents.
//
// @param array : Le tableau à mélanger
// @param equalityFn : Une fonction qui dit si deux objets sont "identiques" (ex: même image)
// @param lastDisplayedItem : (Optionnel) Le dernier élément affiché précédemment, pour éviter une répétition au début.
export function shuffleArrayNoDuplicates<T>(
  array: T[],
  equalityFn: (a: T, b: T) => boolean,
  lastDisplayedItem?: T
): T[] {
  if (array.length <= 1) return [...array];
  
  // Constantes pour éviter de tourner en rond indéfiniment
  const MAX_SHUFFLE_ATTEMPTS = 100;
  const RESHUFFLE_INTERVAL = 10;
  
  // 1. On commence par un mélange simple
  let shuffled = shuffleArray(array);
  
  // Petite fonction locale pour échanger deux éléments
  const swap = (idx1: number, idx2: number) => {
    [shuffled[idx1], shuffled[idx2]] = [shuffled[idx2], shuffled[idx1]];
  };

  // 2. On s'assure que le premier élément n'est pas le même que le dernier vu
  if (lastDisplayedItem && equalityFn(shuffled[0], lastDisplayedItem)) {
    let swapIndex = 1;
    // On cherche le premier élément différent
    while (swapIndex < shuffled.length && equalityFn(shuffled[swapIndex], lastDisplayedItem)) {
      swapIndex++;
    }
    // Et on l'échange avec le premier
    if (swapIndex < shuffled.length) {
      swap(0, swapIndex);
    }
  }
  
  // 3. Correction des doublons consécutifs
  let attempt = 0;
  
  while (attempt < MAX_SHUFFLE_ATTEMPTS) {
    let hasConsecutiveDuplicates = false;
    
    for (let i = 0; i < shuffled.length - 1; i++) {
      // Si l'élément actuel est identique au suivant...
      if (equalityFn(shuffled[i], shuffled[i + 1])) {
        hasConsecutiveDuplicates = true;
        
        // ... on cherche un candidat plus loin pour l'échanger
        let swapIndex = -1;
        for (let j = i + 2; j < shuffled.length; j++) {
          const candidate = shuffled[j];
          const problem = shuffled[i + 1];

          // On vérifie que l'échange ne va pas CRÉER un nouveau problème ailleurs
          const createsIssueAtDest =
            equalityFn(candidate, shuffled[i]) ||
            (i + 2 < shuffled.length && equalityFn(candidate, shuffled[i + 2]));

          const createsIssueAtSource =
            (j > 0 && equalityFn(problem, shuffled[j - 1])) ||
            (j + 1 < shuffled.length && equalityFn(problem, shuffled[j + 1]));
          
          if (!createsIssueAtDest && !createsIssueAtSource) {
            swapIndex = j;
            break;
          }
        }
        
        // Si on a trouvé un candidat, on échange
        if (swapIndex !== -1) {
          swap(i + 1, swapIndex);
        }
      }
    }
    
    // Si on a fait un tour sans trouver de doublons, c'est gagné !
    if (!hasConsecutiveDuplicates) {
      break;
    }
    
    attempt++;
    
    // Si on galère trop, on remélange tout pour repartir sur de nouvelles bases
    if (attempt % RESHUFFLE_INTERVAL === 0) {
      shuffled = shuffleArray(array);
      // On réapplique la règle du premier élément
      if (lastDisplayedItem && equalityFn(shuffled[0], lastDisplayedItem)) {
        let swapIndex = 1;
        while (swapIndex < shuffled.length && equalityFn(shuffled[swapIndex], lastDisplayedItem)) {
          swapIndex++;
        }
        if (swapIndex < shuffled.length) swap(0, swapIndex);
      }
    }
  }
  
  return shuffled;
}