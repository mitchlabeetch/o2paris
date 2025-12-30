export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * Returns a new array without modifying the original
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Checks if two tiles are the same by comparing their IDs
 */
function isSameTile<T extends { id: number }>(tile1: T | undefined, tile2: T | undefined): boolean {
  if (!tile1 || !tile2) return false;
  return tile1.id === tile2.id;
}

/**
 * Enhanced shuffle that prevents consecutive duplicate tiles
 * Also ensures the last tile is different from lastDisplayedTile (for cycle boundaries)
 * Uses Fisher-Yates with post-shuffle optimization to swap consecutive duplicates
 * 
 * @param array - Array of tiles to shuffle
 * @param lastDisplayedTile - Optional last tile from previous cycle to avoid at the start
 * @returns Shuffled array with no consecutive duplicates
 */
export function shuffleArrayNoDuplicates<T extends { id: number }>(
  array: T[],
  lastDisplayedTile?: T
): T[] {
  if (array.length <= 1) return [...array];
  
  // Start with standard Fisher-Yates shuffle
  let shuffled = shuffleArray(array);
  
  // If lastDisplayedTile is provided and matches the first tile, swap it with a different one
  if (lastDisplayedTile && isSameTile(shuffled[0], lastDisplayedTile)) {
    // Find first tile that's different from lastDisplayedTile
    let swapIndex = 1;
    while (swapIndex < shuffled.length && isSameTile(shuffled[swapIndex], lastDisplayedTile)) {
      swapIndex++;
    }
    // If we found a different tile, swap it to the front
    if (swapIndex < shuffled.length) {
      [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]];
    }
  }
  
  // Fix any consecutive duplicates within the shuffled array
  let maxAttempts = 100; // Prevent infinite loops
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    let hasConsecutiveDuplicates = false;
    
    // Find consecutive duplicates
    for (let i = 0; i < shuffled.length - 1; i++) {
      if (isSameTile(shuffled[i], shuffled[i + 1])) {
        hasConsecutiveDuplicates = true;
        
        // Try to find a different tile to swap with shuffled[i+1]
        // Look ahead in the array for a non-duplicate
        let swapIndex = -1;
        for (let j = i + 2; j < shuffled.length; j++) {
          // Check that swapping won't create new consecutive duplicates
          const wouldCreateNewDuplicate = 
            isSameTile(shuffled[j], shuffled[i]) || 
            (j < shuffled.length - 1 && isSameTile(shuffled[j], shuffled[i + 2]));
          
          if (!wouldCreateNewDuplicate) {
            swapIndex = j;
            break;
          }
        }
        
        // If found a good swap candidate, perform the swap
        if (swapIndex !== -1) {
          [shuffled[i + 1], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[i + 1]];
          // Don't break; continue checking for more duplicates
        }
      }
    }
    
    // If no consecutive duplicates found, we're done
    if (!hasConsecutiveDuplicates) {
      break;
    }
    
    attempt++;
    
    // If we've tried too many times, do a complete re-shuffle
    if (attempt % 10 === 0) {
      shuffled = shuffleArray(array);
    }
  }
  
  return shuffled;
}
