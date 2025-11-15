
export interface ExercisePerformance {
    notes?: string;
    sets: { reps: string; completed?: boolean; intensity: string; }[];
    lastPerformance?: {
      sets: { reps: string; intensity: string; }[];
      notes?: string;
    }
}

export type PerformanceLog = {
  exerciseName: string;
  sets: {
    reps: string;
    intensity: string;
    completed?: boolean
  }[];
  notes?: string;
  lastPerformance?: PerformanceLog;
}

export type PerformanceLogs = {
  [id: string]: PerformanceLog
}
