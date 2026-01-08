import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * This file defines the functions your frontend can call.
 * 'query' functions are for reading data.
 * 'mutation' functions are for writing or modifying data.
 */

/**
 * Fetches all workout templates from the database with exercise catalog data joined.
 * Your app calls this to know what exercises to display.
 */
export const get_all_workout_templates = query({
  handler: async (ctx) => {
    const templates = await ctx.db.query("workoutTemplates").collect();
    
    // Get all unique exercise IDs
    const exerciseIds = [...new Set(templates.map(t => t.exerciseId).filter(Boolean))];
    
    // Fetch all exercises from catalog
    const exercises = await Promise.all(
      exerciseIds.map(id => ctx.db.get(id))
    );
    
    // Create a map of exerciseId -> exercise data
    const exerciseMap = new Map();
    exercises.forEach(ex => {
      if (ex) {
        exerciseMap.set(ex._id, ex);
      }
    });
    
    // Join templates with exercise catalog data
    return templates.map(template => {
      const exercise = exerciseMap.get(template.exerciseId);
      return {
        ...template,
        exerciseName: exercise?.exerciseName || '', // Add exerciseName for backward compatibility
        exercise: exercise ? {
          exerciseName: exercise.exerciseName,
          muscles: exercise.muscles,
          isCustom: exercise.isCustom,
          userId: exercise.userId,
        } : null,
      };
    });
  },
});

/**
 * Fetches all custom workout templates from the database with exercise catalog data joined.
 * Your app calls this to know what exercises to display.
 */
export const get_all_custom_workout_templates = query({
  handler: async (ctx) => {
    const templates = await ctx.db.query("customWorkoutTemplates").collect();
    
    // Get all unique exercise IDs
    const exerciseIds = [...new Set(templates.map(t => t.exerciseId).filter(Boolean))];
    
    // Fetch all exercises from catalog
    const exercises = await Promise.all(
      exerciseIds.map(id => ctx.db.get(id))
    );
    
    // Create a map of exerciseId -> exercise data
    const exerciseMap = new Map();
    exercises.forEach(ex => {
      if (ex) {
        exerciseMap.set(ex._id, ex);
      }
    });
    
    // Join templates with exercise catalog data
    return templates.map(template => {
      const exercise = exerciseMap.get(template.exerciseId);
      return {
        ...template,
        exerciseName: exercise?.exerciseName || '', // Add exerciseName for backward compatibility
        exercise: exercise ? {
          exerciseName: exercise.exerciseName,
          muscles: exercise.muscles,
          isCustom: exercise.isCustom,
          userId: exercise.userId,
        } : null,
      };
    });
  },
});

export const get_workout_templates_for_phase = query({
  handler: async (ctx, args: {
    phase: number
  }) => {
    const templates = await ctx.db.query("workoutTemplates")
      .filter(q => q.eq(q.field('phase'), args.phase))
      .collect();
    
    // Get all unique exercise IDs
    const exerciseIds = [...new Set(templates.map(t => t.exerciseId).filter(Boolean))];
    
    // Fetch all exercises from catalog
    const exercises = await Promise.all(
      exerciseIds.map(id => ctx.db.get(id))
    );
    
    // Create a map of exerciseId -> exercise data
    const exerciseMap = new Map();
    exercises.forEach(ex => {
      if (ex) {
        exerciseMap.set(ex._id, ex);
      }
    });
    
    // Join templates with exercise catalog data
    return templates.map(template => {
      const exercise = exerciseMap.get(template.exerciseId);
      return {
        ...template,
        exerciseName: exercise?.exerciseName || '', // Add exerciseName for backward compatibility
        exercise: exercise ? {
          exerciseName: exercise.exerciseName,
          muscles: exercise.muscles,
          isCustom: exercise.isCustom,
          userId: exercise.userId,
        } : null,
      };
    });
  },
});

/**
 * Fetches all of your past workout logs from the database.
 * This is used for the progression graph screen.
 */
export const get_workout_logs = query({
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
export const log_workout = mutation({
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

/**
 * Saves a new workout exercise to the workout templates and catalog
 */
export const create_custom_workout = mutation({
  // 'args' defines the data structure this function expects to receive from your app.
  args: {
    phase: v.number(),
    day: v.number(),
    letter: v.string(),
    exerciseName: v.string(),
    targetIntensity: v.string(),
    targetSets: v.number(),
    targetReps: v.string(), // Kept as string to accommodate ranges like "8-10"
    tempo: v.string(),
    rest: v.string(),
  },
  // 'handler' contains the logic that runs on the server.
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to log a workout.");
    }

    // Check if exercise exists in catalog
    let catalogExercise = await ctx.db
      .query("exerciseCatalog")
      .withIndex("by_exercise_name", (q) => q.eq("exerciseName", args.exerciseName))
      .first();

    // If not in catalog, create it
    if (!catalogExercise) {
      const catalogId = await ctx.db.insert("exerciseCatalog", {
        exerciseName: args.exerciseName,
        isCustom: true,
        userId: identity.subject,
        muscles: undefined, // Can be set later
      });
      catalogExercise = await ctx.db.get(catalogId);
    }

    if (!catalogExercise) {
      throw new Error("Failed to create or retrieve exercise from catalog");
    }

    // Check if customWorkoutTemplate already exists (by exerciseId)
    const exerciseExists = await ctx.db
      .query("customWorkoutTemplates")
      .withIndex("by_exercise_id", (q) => q.eq("exerciseId", catalogExercise!._id))
      .filter(q => q.eq(q.field('userId'), identity.subject))
      .first();

    if (!exerciseExists) {
      const createdExercise = await ctx.db.insert("customWorkoutTemplates", {
        userId: identity.subject,
        phase: 0,
        day: 0,
        letter: '',
        exerciseId: catalogExercise._id,
        targetIntensity: args.targetIntensity,
        targetSets: args.targetSets,
        targetReps: args.targetReps,
        tempo: args.tempo,
        rest: args.rest
      });
      return createdExercise;
    }

    return exerciseExists;
  },
});


export const get_last_workout_log = query({
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

/**
 * Updates the exercise name for a custom exercise in the catalog
 */
export const update_custom_exercise_name = mutation({
  args: {
    oldName: v.string(),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to update an exercise.");
    }

    // Find the exercise in the catalog
    const exercise = await ctx.db
      .query("exerciseCatalog")
      .withIndex("by_exercise_name", (q) => q.eq("exerciseName", args.oldName))
      .first();

    if (!exercise || !exercise.isCustom || exercise.userId !== identity.subject) {
      throw new Error("Exercise not found or you don't have permission to update it.");
    }

    // Update the catalog entry
    await ctx.db.patch(exercise._id, {
      exerciseName: args.newName,
    });

    // Templates are now linked by exerciseId, so no need to update them
    // The exerciseId reference will automatically point to the updated exercise

    return { success: true };
  },
});

/**
 * Updates the muscles for a custom exercise in the catalog
 */
export const update_custom_exercise_muscles = mutation({
  args: {
    exerciseName: v.string(),
    muscles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to update an exercise.");
    }

    // Find the exercise in the catalog
    const exercise = await ctx.db
      .query("exerciseCatalog")
      .withIndex("by_exercise_name", (q) => q.eq("exerciseName", args.exerciseName))
      .first();

    if (!exercise || !exercise.isCustom || exercise.userId !== identity.subject) {
      throw new Error("Exercise not found or you don't have permission to update it.");
    }

    await ctx.db.patch(exercise._id, {
      muscles: args.muscles,
    });

    return { success: true };
  },
});

/**
 * Gets a custom exercise by name from the catalog (for finding exercise to edit)
 */
export const get_custom_exercise_by_name = query({
  args: {
    exerciseName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const exercise = await ctx.db
      .query("exerciseCatalog")
      .withIndex("by_exercise_name", (q) => q.eq("exerciseName", args.exerciseName))
      .first();

    // Verify it's a custom exercise owned by the user
    if (exercise && exercise.isCustom && exercise.userId === identity.subject) {
      return exercise;
    }

    return null;
  },
});

/**
 * Updates muscle groups for an exercise in the catalog
 */
export const update_exercise_muscles = mutation({
  args: { exerciseName: v.string(), muscles: v.array(v.string()) },
  handler: async (ctx, args) => {
    const exercise = await ctx.db
      .query("exerciseCatalog")
      .withIndex("by_exercise_name", (q) => q.eq("exerciseName", args.exerciseName))
      .first();

    if (!exercise) {
      throw new Error(`Exercise "${args.exerciseName}" not found in catalog`);
    }

    await ctx.db.patch(exercise._id, {
      muscles: args.muscles,
    });

    return { success: true };
  },
});

/**
 * Gets muscle mappings for all exercises from the catalog
 * Returns a map of exerciseName -> muscles[]
 */
export const get_exercise_muscle_mappings = query({
  handler: async (ctx) => {
    const exercises = await ctx.db.query("exerciseCatalog").collect();
    
    // Create a map of exercise names to their muscles
    const muscleMap: Record<string, string[]> = {};
    
    exercises.forEach(exercise => {
      if (exercise.muscles && exercise.muscles.length > 0) {
        muscleMap[exercise.exerciseName] = exercise.muscles;
      }
    });

    return muscleMap;
  },
});

/**
 * Gets all exercises from the catalog
 */
export const get_all_exercises = query({
  handler: async (ctx) => {
    return await ctx.db.query("exerciseCatalog").collect();
  },
});

/**
 * Gets an exercise from the catalog by name
 */
export const get_exercise_by_name = query({
  args: { exerciseName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("exerciseCatalog")
      .withIndex("by_exercise_name", (q) => q.eq("exerciseName", args.exerciseName))
      .first();
  },
});

/**
 * Creates or updates an exercise in the catalog
 */
export const upsert_exercise = mutation({
  args: {
    exerciseName: v.string(),
    muscles: v.optional(v.array(v.string())),
    isCustom: v.boolean(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // Check if exercise already exists
    const existing = await ctx.db
      .query("exerciseCatalog")
      .withIndex("by_exercise_name", (q) => q.eq("exerciseName", args.exerciseName))
      .first();

    if (existing) {
      // Update existing exercise
      await ctx.db.patch(existing._id, {
        muscles: args.muscles,
        isCustom: args.isCustom,
        userId: args.isCustom && identity ? identity.subject : args.userId,
      });
      return { success: true, exerciseId: existing._id, created: false };
    } else {
      // Create new exercise
      const exerciseId = await ctx.db.insert("exerciseCatalog", {
        exerciseName: args.exerciseName,
        muscles: args.muscles,
        isCustom: args.isCustom,
        userId: args.isCustom && identity ? identity.subject : args.userId,
      });
      return { success: true, exerciseId, created: true };
    }
  },
});

/**
 * @deprecated This function is deprecated. Use seedMuscleMappings in seed_muscle_data.ts instead.
 * Seeds exercise catalog with muscle data from the hardcoded mapping
 * This is a one-time migration function
 */
export const seed_workout_template_muscles = mutation({
  args: {
    mappings: v.array(v.object({
      exerciseName: v.string(),
      muscles: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    let updated = 0;
    
    for (const mapping of args.mappings) {
      const exercise = await ctx.db
        .query("exerciseCatalog")
        .withIndex("by_exercise_name", (q) => q.eq("exerciseName", mapping.exerciseName))
        .first();

      if (exercise) {
        if (!exercise.muscles || exercise.muscles.length === 0) {
          await ctx.db.patch(exercise._id, {
            muscles: mapping.muscles,
          });
          updated++;
        }
      }
    }

    return { success: true, updated };
  },
});
