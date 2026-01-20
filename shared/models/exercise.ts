
export interface ExercisePerformance {
    notes?: string;
    sets: { reps: string; completed?: boolean; intensity: string; }[];
    lastPerformance?: {
      sets: { reps: string; intensity: string; }[];
      notes?: string;
    }
}

export type PerformanceLog = {
  exerciseId: string;
  exerciseName: string;
  sets: {
    reps: string;
    intensity: string;
    isPB?: boolean; // Personal Best / Best Effort marker
  }[];
  notes?: string;
  lastPerformance?: PerformanceLog;
}

export type PerformanceLogs = {
  [id: string]: PerformanceLog
}
