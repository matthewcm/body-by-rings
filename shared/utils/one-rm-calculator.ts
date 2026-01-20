/**
 * Calculates estimated 1RM (One Rep Max) using the Epley formula
 * Formula: weight × (1 + reps / 30)
 * 
 * @param reps - Number of reps performed
 * @param intensity - Weight/intensity used (as string, will be parsed to number)
 * @returns Estimated 1RM or null if unable to calculate
 */
export const calculate1RM = (reps: number, intensity: string): number | null => {
  const weight = parseFloat(intensity);
  if (isNaN(weight) || weight <= 0 || reps <= 0) {
    return null;
  }
  
  // Epley formula: weight × (1 + reps / 30)
  return weight * (1 + reps / 30);
};

/**
 * Calculates estimated 1RM from a set
 * @param set - Set with reps and intensity
 * @returns Estimated 1RM or null
 */
export const calculate1RMFromSet = (set: { reps: string; intensity: string }): number | null => {
  const reps = parseInt(set.reps, 10);
  if (isNaN(reps) || reps <= 0) {
    return null;
  }
  
  return calculate1RM(reps, set.intensity);
};

/**
 * Finds the best 1RM from multiple sets
 * @param sets - Array of sets
 * @returns Best 1RM or null
 */
export const findBest1RM = (sets: Array<{ reps: string; intensity: string }>): number | null => {
  const oneRMs = sets
    .map(set => calculate1RMFromSet(set))
    .filter((rm): rm is number => rm !== null);
  
  if (oneRMs.length === 0) {
    return null;
  }
  
  return Math.max(...oneRMs);
};
