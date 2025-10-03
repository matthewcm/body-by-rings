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

  // Table to store your actual, completed workout logs
  workoutLogs: defineTable({
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
  }),
});


