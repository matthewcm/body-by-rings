import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * This file defines the functions your frontend can call.
 * 'query' functions are for reading data.
 * 'mutation' functions are for writing or modifying data.
 */

/**
 * Fetches all workout templates from the database.
 * Your app calls this to know what exercises to display.
 */
export const getWorkoutTemplates = query({
  handler: async (ctx) => {
    // This line tells the database to get everything from the "workoutTemplates" table.
    return await ctx.db.query("workoutTemplates").collect();
  },
});

/**
 * Fetches all of your past workout logs from the database.
 * This is used for the progression graph screen.
 */
export const getWorkoutLogs = query({
  handler: async (ctx) => {
    // '.order("desc")' returns the most recent logs first.
    return await ctx.db.query("workoutLogs").order("desc").collect();
  },
});


/**
 * Saves a new, completed workout log to the database.
 * This is called when you press "Finish & Save Workout".
 */
export const logWorkout = mutation({
  // 'args' defines the data structure this function expects to receive from your app.
  args: {
    date: v.string(),
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
  },
  // 'handler' contains the logic that runs on the server.
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("workoutLogs", {
      date: args.date,
      day: args.day,
      phase: args.phase,
      performance: args.performance,
    });
    return logId;
  },
});


