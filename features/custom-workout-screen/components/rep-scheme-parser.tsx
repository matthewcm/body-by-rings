'use client';

/**
 * Parses a rep scheme string (e.g., "21-15-9", "5x5", "3 rounds") into an array of rep numbers
 * @param repScheme - The rep scheme string (e.g., "21-15-9", "5x5", "10")
 * @returns Array of rep numbers, or empty array if unable to parse
 */
export const parseRepScheme = (repScheme: string | null | undefined): number[] => {
  if (!repScheme) return [];

  const trimmed = repScheme.trim();

  // Handle patterns like "21-15-9" or "21, 15, 9"
  if (trimmed.includes('-') || trimmed.includes(',')) {
    const parts = trimmed.split(/[-,\s]+/).filter(p => p.trim());
    const reps = parts
      .map(part => {
        const num = parseInt(part.trim(), 10);
        return isNaN(num) ? null : num;
      })
      .filter((r): r is number => r !== null);
    
    if (reps.length > 0) {
      return reps;
    }
  }

  // Handle patterns like "5x5" (5 sets of 5 reps)
  const xPattern = /^(\d+)x(\d+)$/i;
  const xMatch = trimmed.match(xPattern);
  if (xMatch) {
    const sets = parseInt(xMatch[1], 10);
    const reps = parseInt(xMatch[2], 10);
    if (!isNaN(sets) && !isNaN(reps) && sets > 0 && reps > 0) {
      return Array(sets).fill(reps);
    }
  }

  // Handle single number (e.g., "10" means 1 set of 10 reps)
  const singleNum = parseInt(trimmed, 10);
  if (!isNaN(singleNum) && singleNum > 0) {
    return [singleNum];
  }

  // Handle "rounds" patterns like "3 rounds" or "3 Rounds"
  const roundsPattern = /^(\d+)\s*rounds?$/i;
  const roundsMatch = trimmed.match(roundsPattern);
  if (roundsMatch) {
    const rounds = parseInt(roundsMatch[1], 10);
    if (!isNaN(rounds) && rounds > 0) {
      // For rounds, we'll create sets but without specific rep counts
      // Return empty array to indicate rounds but no specific reps
      return [];
    }
  }

  return [];
};

/**
 * Creates initial sets for a performance log based on a rep scheme
 * @param repScheme - The rep scheme string
 * @returns Array of set objects with reps pre-filled
 */
export const createSetsFromRepScheme = (repScheme: string | null | undefined) => {
  const reps = parseRepScheme(repScheme);
  
  if (reps.length === 0) {
    // If no rep scheme or unable to parse, return a single empty set
    return [{ reps: '', intensity: '', completed: false }];
  }

  // Create sets with reps pre-filled
  return reps.map(rep => ({
    reps: rep.toString(),
    intensity: '',
    completed: false,
  }));
};
