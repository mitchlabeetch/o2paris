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
 * Enhanced shuffle that prevents consecutive duplicate tiles
 * Uses Fisher-Yates with post-shuffle optimization to swap consecutive duplicates
 * 
 * @param array - Array of items to shuffle
 * @param equalityFn - Function to determine if two items are duplicates
 * @param lastDisplayedItem - Optional last item from previous cycle to avoid at the start
 * @returns Shuffled array with minimized consecutive duplicates
 */
export function shuffleArrayNoDuplicates<T>(
  array: T[],
  equalityFn: (a: T, b: T) => boolean,
  lastDisplayedItem?: T
): T[] {
  if (array.length <= 1) return [...array];
  
  // Constants for algorithm tuning
  const MAX_SHUFFLE_ATTEMPTS = 100; // Prevent infinite loops
  const RESHUFFLE_INTERVAL = 10; // Re-shuffle every N attempts
  
  // Start with standard Fisher-Yates shuffle
  let shuffled = shuffleArray(array);
  
  // Helper to swap elements
  const swap = (idx1: number, idx2: number) => {
    [shuffled[idx1], shuffled[idx2]] = [shuffled[idx2], shuffled[idx1]];
  };

  // Ensure first item is different from lastDisplayedItem
  if (lastDisplayedItem && equalityFn(shuffled[0], lastDisplayedItem)) {
    // Find first item that's different
    let swapIndex = 1;
    while (swapIndex < shuffled.length && equalityFn(shuffled[swapIndex], lastDisplayedItem)) {
      swapIndex++;
    }

    // If we found a different item, swap it to the front
    if (swapIndex < shuffled.length) {
      swap(0, swapIndex);
    }
  }
  
  // Fix any consecutive duplicates within the shuffled array
  let attempt = 0;
  
  while (attempt < MAX_SHUFFLE_ATTEMPTS) {
    let hasConsecutiveDuplicates = false;
    
    // Find consecutive duplicates
    for (let i = 0; i < shuffled.length - 1; i++) {
      if (equalityFn(shuffled[i], shuffled[i + 1])) {
        hasConsecutiveDuplicates = true;
        
        // Try to find a different item to swap with shuffled[i+1]
        // Look ahead in the array for a non-duplicate
        let swapIndex = -1;
        for (let j = i + 2; j < shuffled.length; j++) {
          // Check that swapping won't create new consecutive duplicates
          // After swap: shuffled[j] goes to position i+1, shuffled[i+1] goes to position j
          const candidate = shuffled[j];
          const problem = shuffled[i + 1];

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
        
        // If found a good swap candidate, perform the swap
        if (swapIndex !== -1) {
          swap(i + 1, swapIndex);
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
    if (attempt % RESHUFFLE_INTERVAL === 0) {
      shuffled = shuffleArray(array);
      // Re-apply lastDisplayedItem constraint after re-shuffle
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
