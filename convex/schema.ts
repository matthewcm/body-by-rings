import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * This file defines the "shape" of your database.
 * Each 'defineTable' corresponds to a table in your database.
 */
export default defineSchema({
  // Catalog of all exercises with their metadata (muscles, defaults, etc.)
  exerciseCatalog: defineTable({
    exerciseName: v.string(), // Unique exercise name (primary key equivalent)
    muscles: v.optional(v.array(v.string())), // Array of muscle groups worked by this exercise
    isCustom: v.boolean(), // true for user-created exercises, false for standard exercises
    userId: v.optional(v.string()), // User ID for custom exercises (null for standard)
  })
    .index("by_exercise_name", ["exerciseName"]) // Index for looking up exercises by name
    .index("by_user", ["userId"]), // Index for user-specific exercises

  // Programs (workout plans)
  programs: defineTable({
    title: v.string(),
    description: v.string(),
    numberOfPhases: v.number(),
    isActive: v.boolean(),
    userId: v.string(), // User who created/owns this program
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),

  phaseTemplates: defineTable({
    programId: v.optional(v.id("programs")), // Reference to the program this phase belongs to (optional for backward compatibility)
    day: v.float64(),
    phase: v.float64(),
    title: v.string(),
    type: v.optional(v.string()),
  })
    .index("by_program", ["programId"])
    .index("by_program_phase", ["programId", "phase"]),

  // Table to store your workout plan/template
  workoutTemplates: defineTable({
    programId: v.optional(v.id("programs")), // Reference to the program this template belongs to (optional for backward compatibility)
    phase: v.number(),
    day: v.number(),
    letter: v.string(),
    exerciseId: v.id("exerciseCatalog"), // Reference to exerciseCatalog
    targetIntensity: v.string(), // Can override catalog defaults
    targetSets: v.number(), // Can override catalog defaults
    targetReps: v.string(), // Kept as string to accommodate ranges like "8-10"
    tempo: v.string(), // Can override catalog defaults
    rest: v.string(), // Can override catalog defaults
  })
    .index("by_program", ["programId"])
    .index("by_day", ["day"]) // An index makes querying by day faster
    .index("by_exercise_id", ["exerciseId"]), // Index for looking up exercises by ID

  customWorkoutTemplates: defineTable({
    phase: v.number(),
    day: v.number(),
    letter: v.string(),
    exerciseId: v.id("exerciseCatalog"), // Reference to exerciseCatalog
    targetIntensity: v.string(), // Can override catalog defaults
    targetSets: v.number(), // Can override catalog defaults
    targetReps: v.string(), // Kept as string to accommodate ranges like "8-10"
    tempo: v.string(), // Can override catalog defaults
    rest: v.string(), // Can override catalog defaults
    userId: v.string(),
  })
    .index("by_day", ["day"]) // An index makes querying by day faster
    .index("by_exercise_id", ["exerciseId"]), // Index for looking up exercises by ID

  // Table to store your actual, completed workout logs
  workoutLogs: defineTable({
    userId: v.string(),
    date: v.string(), // ISO 8601 string for consistency
    day: v.number(),
    phase: v.number(),
    performance: v.array(
      v.object({
        exerciseName: v.string(),
        notes: v.string(),
        sets: v.array(
          v.object({
            reps: v.string(),
            intensity: v.string(),
          })
        ),
      })
    ),
  })
    .index("by_user", ["userId"]) // Allows Convex to quickly find all logs for a specific user
    .index("by_user_phase_day", ["userId", "phase", "day"]),
});
