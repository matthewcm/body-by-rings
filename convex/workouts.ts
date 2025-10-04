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
export const getAllWorkoutTemplates = query({
  handler: async (ctx) => {
    // This line tells the database to get everything from the "workoutTemplates" table.
    return ((await ctx.db.query("workoutTemplates").collect()))
  },
});

export const getWorkoutTemplatesForPhase = query({
  handler: async (ctx, args: {
    phase: number
  }) => {
    return (await ctx.db.query("workoutTemplates")
      .filter(q => q.eq(q.field('phase'), args.phase))
      .collect())
  },
});

/**
 * Fetches all of your past workout logs from the database.
 * This is used for the progression graph screen.
 */
export const getWorkoutLogs = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // If no user is logged in, return no logs
      return [];
    }
    // Fetch logs using the index we created, matching the user's ID
    return await ctx.db
      .query("workoutLogs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect()
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to log a workout.");
    }

    const logId = await ctx.db.insert("workoutLogs", {
      // 👇 ADD THIS LINE
      userId: identity.subject, // `identity.subject` is the user's unique ID
      date: args.date,
      day: args.day,
      phase: args.phase,
      performance: args.performance,
    });
    return logId;
  },
});


export const getLastWorkoutLog = query({
  // Define the arguments this query expects: a phase and a day
  args: {
    phase: v.number(),
    day: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Get the identity of the currently logged-in user
    const identity = await ctx.auth.getUserIdentity();

    // If no user is logged in, there are no logs to fetch
    if (!identity) {
      return null;
    }

    // 2. Query the 'workoutLogs' table using the efficient index
    const lastLog = await ctx.db
      .query("workoutLogs")
      .withIndex("by_user_phase_day", (q) =>
        q
          .eq("userId", identity.subject) // Match the current user's ID
          .eq("phase", args.phase)       // Match the requested phase
          .eq("day", args.day)           // Match the requested day
      )
      .order("desc") // Sort the results by creation time to get the newest first
      .first();     // Return only the single most recent log

    return lastLog;
  },
});
