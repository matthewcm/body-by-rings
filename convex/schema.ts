import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * This file defines the "shape" of your database.
 * Each 'defineTable' corresponds to a table in your database.
 */
export default defineSchema({
  // Table to store your workout plan/template
  workoutTemplates: defineTable({
    phase: v.number(),
    day: v.number(),
    letter: v.string(),
    exerciseName: v.string(),
    targetIntensity: v.string(),
    targetSets: v.number(),
    targetReps: v.string(), // Kept as string to accommodate ranges like "8-10"
    tempo: v.string(),
    rest: v.string(),
  }).index("by_day", ["day"]), // An index makes querying by day faster

  customWorkoutTemplates: defineTable({
    phase: v.number(),
    day: v.number(),
    letter: v.string(),
    exerciseName: v.string(),
    targetIntensity: v.string(),
    targetSets: v.number(),
    targetReps: v.string(), // Kept as string to accommodate ranges like "8-10"
    tempo: v.string(),
    rest: v.string(),
    userId: v.string(),
    muscles: v.optional(v.array(v.string())), // Array of muscle groups worked by this exercise
  }).index("by_day", ["day"]), // An index makes querying by day faster

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



  phaseTemplates: defineTable({
    day: v.float64(),
    phase: v.float64(),
    title: v.string(),
    type: v.optional(v.string()),
  }),
});


