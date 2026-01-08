import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Gets the active program for the current user
 */
export const get_active_program = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("programs")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", identity.subject).eq("isActive", true)
      )
      .first();
  },
});

/**
 * Gets a program by ID
 */
export const get_program_by_id = query({
  args: {
    programId: v.id("programs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const program = await ctx.db.get(args.programId);
    if (!program || program.userId !== identity.subject) {
      return null;
    }

    return program;
  },
});

/**
 * Gets all programs for the current user
 */
export const get_all_programs = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("programs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

/**
 * Creates a new program
 */
export const create_program = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    numberOfPhases: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to create a program.");
    }

    // Deactivate all existing programs for this user
    const existingPrograms = await ctx.db
      .query("programs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    for (const program of existingPrograms) {
      await ctx.db.patch(program._id, { isActive: false });
    }

    // Create the new program as active
    const programId = await ctx.db.insert("programs", {
      title: args.title,
      description: args.description,
      numberOfPhases: args.numberOfPhases,
      isActive: true,
      userId: identity.subject,
    });

    // Create empty phase templates for each phase
    for (let phase = 1; phase <= args.numberOfPhases; phase++) {
      await ctx.db.insert("phaseTemplates", {
        programId: programId,
        day: 0,
        phase: phase,
        title: `Phase ${phase}`,
      });
    }

    return programId;
  },
});

/**
 * Deactivates (disables) the active program and removes its phases/templates
 */
export const deactivate_program = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to deactivate a program.");
    }

    // Find active program
    const activeProgram = await ctx.db
      .query("programs")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", identity.subject).eq("isActive", true)
      )
      .first();

    if (!activeProgram) {
      return { success: false, message: "No active program found" };
    }

    // Delete all workout templates for this program
    // Note: programId is optional, so we filter manually to handle all cases
    const allTemplates = await ctx.db.query("workoutTemplates").collect();
    const templates = allTemplates.filter(t => t.programId === activeProgram._id);

    for (const template of templates) {
      await ctx.db.delete(template._id);
    }

    // Delete all phase templates for this program
    // Note: programId might be optional, so we need to filter
    const allPhases = await ctx.db.query("phaseTemplates").collect();
    const phases = allPhases.filter(p => p.programId === activeProgram._id);

    for (const phase of phases) {
      await ctx.db.delete(phase._id);
    }

    // Delete the program itself
    await ctx.db.delete(activeProgram._id);

    return { success: true, message: "Program deactivated and removed" };
  },
});

/**
 * Gets all workout templates for a specific program and phase
 */
export const get_program_templates = query({
  args: {
    programId: v.id("programs"),
    phase: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_program", (q) => q.eq("programId", args.programId))
      .collect();

    // Filter by phase if provided
    const filtered = args.phase
      ? templates.filter((t) => t.phase === args.phase)
      : templates;

    // Get unique exercise IDs and fetch from catalog
    const exerciseIds = [...new Set(filtered.map((t) => t.exerciseId).filter(Boolean))];
    const exercises = await Promise.all(
      exerciseIds.map((id) => ctx.db.get(id))
    );

    const exerciseMap = new Map();
    exercises.forEach((ex) => {
      if (ex) {
        exerciseMap.set(ex._id, ex);
      }
    });

    // Join with exercise catalog
    return filtered.map((template) => {
      const exercise = exerciseMap.get(template.exerciseId);
      return {
        ...template,
        exerciseName: exercise?.exerciseName || "",
        exercise: exercise
          ? {
              exerciseName: exercise.exerciseName,
              muscles: exercise.muscles,
              isCustom: exercise.isCustom,
              userId: exercise.userId,
            }
          : null,
      };
    });
  },
});

/**
 * Updates a workout template (for editing exercises in phases)
 */
export const update_workout_template = mutation({
  args: {
    templateId: v.id("workoutTemplates"),
    exerciseId: v.optional(v.id("exerciseCatalog")),
    targetIntensity: v.optional(v.string()),
    targetSets: v.optional(v.number()),
    targetReps: v.optional(v.string()),
    tempo: v.optional(v.string()),
    rest: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to update a template.");
    }

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Verify the program belongs to the user
    const program = await ctx.db.get(template.programId);
    if (!program || program.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const update: any = {};
    if (args.exerciseId !== undefined) update.exerciseId = args.exerciseId;
    if (args.targetIntensity !== undefined) update.targetIntensity = args.targetIntensity;
    if (args.targetSets !== undefined) update.targetSets = args.targetSets;
    if (args.targetReps !== undefined) update.targetReps = args.targetReps;
    if (args.tempo !== undefined) update.tempo = args.tempo;
    if (args.rest !== undefined) update.rest = args.rest;

    await ctx.db.patch(args.templateId, update);

    return { success: true };
  },
});

/**
 * Adds a new exercise template to a program phase
 */
export const add_program_exercise = mutation({
  args: {
    programId: v.id("programs"),
    phase: v.number(),
    day: v.number(),
    letter: v.string(),
    exerciseId: v.id("exerciseCatalog"),
    targetIntensity: v.string(),
    targetSets: v.number(),
    targetReps: v.string(),
    tempo: v.string(),
    rest: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to add an exercise.");
    }

    // Verify the program belongs to the user
    const program = await ctx.db.get(args.programId);
    if (!program || program.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const templateId = await ctx.db.insert("workoutTemplates", {
      programId: args.programId,
      phase: args.phase,
      day: args.day,
      letter: args.letter,
      exerciseId: args.exerciseId,
      targetIntensity: args.targetIntensity,
      targetSets: args.targetSets,
      targetReps: args.targetReps,
      tempo: args.tempo,
      rest: args.rest,
    });

    return templateId;
  },
});

/**
 * Deletes a workout template
 */
export const delete_workout_template = mutation({
  args: {
    templateId: v.id("workoutTemplates"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, message: "You must be logged in to delete a template." };
    }

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      return { success: false, message: "Template not found" };
    }

    // Verify the program belongs to the user (if template has a programId)
    if (template.programId) {
      const program = await ctx.db.get(template.programId);
      if (!program || program.userId !== identity.subject) {
        return { success: false, message: "Unauthorized" };
      }
    }

    await ctx.db.delete(args.templateId);

    return { success: true, message: "Template deleted successfully" };
  },
});
