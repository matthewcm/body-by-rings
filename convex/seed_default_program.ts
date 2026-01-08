import { mutation } from "./_generated/server";

/**
 * Creates the default "Body By Rings" program for a user if they don't have one
 * This can be called on first login or when a user needs a default program
 */
export const seed_default_program = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, message: "You must be logged in to seed a default program." };
    }

    const userId = identity.subject;

    // Check if user already has any programs
    const existingPrograms = await ctx.db
      .query("programs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (existingPrograms.length > 0) {
      return {
        success: true,
        message: "User already has programs. Skipping default program creation.",
        programId: null,
      };
    }

    // Create the default "Body By Rings Program"
    const programId = await ctx.db.insert("programs", {
      title: "Body By Rings Program",
      description: "A progressive calisthenics program focused on building strength with gymnastic rings.",
      numberOfPhases: 3,
      isActive: true,
      userId: userId,
    });

    // Create phase templates for the 3 phases
    const phaseTemplates = [
      { phase: 1, day: 1, title: "Foundation", type: "Full Body" },
      { phase: 1, day: 2, title: "Foundation", type: "Push" },
      { phase: 1, day: 3, title: "Foundation", type: "Pull" },
      { phase: 1, day: 4, title: "Foundation", type: "Rest" },
      { phase: 2, day: 1, title: "Building", type: "Full Body" },
      { phase: 2, day: 2, title: "Building", type: "Push" },
      { phase: 2, day: 3, title: "Building", type: "Pull" },
      { phase: 2, day: 4, title: "Building", type: "Rest" },
      { phase: 3, day: 1, title: "Peak", type: "Full Body" },
      { phase: 3, day: 2, title: "Peak", type: "Push" },
      { phase: 3, day: 3, title: "Peak", type: "Pull" },
      { phase: 3, day: 4, title: "Peak", type: "Rest" },
    ];

    for (const phaseTemplate of phaseTemplates) {
      await ctx.db.insert("phaseTemplates", {
        programId: programId,
        day: phaseTemplate.day,
        phase: phaseTemplate.phase,
        title: phaseTemplate.title,
        type: phaseTemplate.type,
      });
    }

    return {
      success: true,
      message: "Default Body By Rings Program created successfully",
      programId: programId,
    };
  },
});

/**
 * Ensures user has a default program - can be called on app initialization
 * This function gracefully handles the case where the user is not authenticated yet
 */
export const ensure_default_program = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return success: false but don't throw - this allows the caller to handle it gracefully
      return { success: false, message: "You must be logged in.", programId: null };
    }

    const userId = identity.subject;

    // Check if user has an active program
    const activeProgram = await ctx.db
      .query("programs")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("isActive", true)
      )
      .first();

    if (activeProgram) {
      return {
        success: true,
        message: "User already has an active program.",
        programId: activeProgram._id,
      };
    }

    // Check if user has any programs at all
    const allPrograms = await ctx.db
      .query("programs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // If user has programs but none active, don't create default - let them choose
    if (allPrograms.length > 0) {
      return {
        success: true,
        message: "User has programs but none active. Please activate a program.",
        programId: null,
      };
    }

    // User has no programs - create the default one
    const programId = await ctx.db.insert("programs", {
      title: "Body By Rings Program",
      description: "A progressive calisthenics program focused on building strength with gymnastic rings.",
      numberOfPhases: 3,
      isActive: true,
      userId: userId,
    });

    // Create phase templates
    const phaseTemplates = [
      { phase: 1, day: 1, title: "Foundation", type: "Full Body" },
      { phase: 1, day: 2, title: "Foundation", type: "Push" },
      { phase: 1, day: 3, title: "Foundation", type: "Pull" },
      { phase: 1, day: 4, title: "Foundation", type: "Rest" },
      { phase: 2, day: 1, title: "Building", type: "Full Body" },
      { phase: 2, day: 2, title: "Building", type: "Push" },
      { phase: 2, day: 3, title: "Building", type: "Pull" },
      { phase: 2, day: 4, title: "Building", type: "Rest" },
      { phase: 3, day: 1, title: "Peak", type: "Full Body" },
      { phase: 3, day: 2, title: "Peak", type: "Push" },
      { phase: 3, day: 3, title: "Peak", type: "Pull" },
      { phase: 3, day: 4, title: "Peak", type: "Rest" },
    ];

    for (const phaseTemplate of phaseTemplates) {
      await ctx.db.insert("phaseTemplates", {
        programId: programId,
        day: phaseTemplate.day,
        phase: phaseTemplate.phase,
        title: phaseTemplate.title,
        type: phaseTemplate.type,
      });
    }

    return {
      success: true,
      message: "Default Body By Rings Program created and activated",
      programId: programId,
    };
  },
});
