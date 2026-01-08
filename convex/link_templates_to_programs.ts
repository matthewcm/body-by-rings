import { mutation } from "./_generated/server";

/**
 * Migration: Links existing workout templates without programId to the current user's active program
 * 
 * This migration runs for the authenticated user:
 * 1. Finds all workout templates without programId (global templates)
 * 2. Gets or creates an active program for the user
 * 3. Copies all global templates to the user's program (with programId set)
 * 
 * This ensures all templates are linked to a program for proper program-based filtering.
 */
export const link_templates_to_programs = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, message: "You must be logged in to link templates." };
    }

    const userId = identity.subject;
    let templatesCopied = 0;
    let programsCreated = 0;
    let errors: string[] = [];

    try {
      // Step 1: Find all workout templates without programId (global templates)
      const allTemplates = await ctx.db.query("workoutTemplates").collect();
      const globalTemplates = allTemplates.filter(t => !t.programId);

      if (globalTemplates.length === 0) {
        return {
          success: true,
          message: "All templates already have programId",
          templatesCopied: 0,
          programsCreated: 0,
        };
      }

      // Step 2: Get or create active program for this user
      let activeProgram = await ctx.db
        .query("programs")
        .withIndex("by_user_active", (q) =>
          q.eq("userId", userId).eq("isActive", true)
        )
        .first();

      let programId;

      if (!activeProgram) {
        // Check if user has any programs
        const userPrograms = await ctx.db
          .query("programs")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect();

        if (userPrograms.length === 0) {
          // Create a default program
          const phasesSet = new Set(globalTemplates.map(t => t.phase));
          const numberOfPhases = phasesSet.size > 0 ? Math.max(...Array.from(phasesSet)) : 3;

          programId = await ctx.db.insert("programs", {
            title: "Body By Rings Program",
            description: "A progressive calisthenics program focused on building strength with gymnastic rings.",
            numberOfPhases: numberOfPhases,
            isActive: true,
            userId: userId,
          });
          programsCreated++;

          // Create phase templates
          const phases = Array.from(phasesSet).sort((a, b) => a - b);
          for (const phase of phases) {
            await ctx.db.insert("phaseTemplates", {
              programId: programId,
              day: 0,
              phase: phase,
              title: `Phase ${phase}`,
            });
          }
        } else {
          // User has programs but none active - activate the first one
          programId = userPrograms[0]._id;
          await ctx.db.patch(programId, { isActive: true });
        }
      } else {
        programId = activeProgram._id;
      }

      // Step 3: Check if this program already has templates
      const existingProgramTemplates = await ctx.db
        .query("workoutTemplates")
        .withIndex("by_program", (q) => q.eq("programId", programId))
        .first();

      if (existingProgramTemplates) {
        return {
          success: true,
          message: "Program already has templates linked. No action needed.",
          templatesCopied: 0,
          programsCreated: 0,
        };
      }

      // Step 4: Copy all global templates to this user's program
      for (const template of globalTemplates) {
        try {
          await ctx.db.insert("workoutTemplates", {
            programId: programId,
            phase: template.phase,
            day: template.day,
            letter: template.letter,
            exerciseId: template.exerciseId,
            targetIntensity: template.targetIntensity,
            targetSets: template.targetSets,
            targetReps: template.targetReps,
            tempo: template.tempo,
            rest: template.rest,
          });
          templatesCopied++;
        } catch (error) {
          errors.push(`Failed to copy template: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return {
        success: true,
        message: `Migration complete: ${templatesCopied} templates linked to program, ${programsCreated} program(s) created`,
        templatesCopied,
        programsCreated,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        templatesCopied,
        programsCreated,
        errors: errors.length > 0 ? errors : undefined,
      };
    }
  },
});
