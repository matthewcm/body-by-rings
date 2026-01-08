import { mutation } from "./_generated/server";

/**
 * Migration: Creates a "Body By Rings" program for existing users and migrates existing phases/templates
 * 
 * Strategy:
 * - Find all existing phaseTemplates (these are the original phases)
 * - Get all users who have workout logs or custom workout templates
 * - For each user, create a "Body By Rings Program" if they don't have an active one
 * - Migrate all existing phaseTemplates (without programId) to each user's program
 * - Copy all existing global templates (without programId) to each user's program
 * - Set the program as active (default)
 */
export const migrate_program_ids = mutation({
  args: {},
  handler: async (ctx) => {
    let templatesCopied = 0;
    let phasesMigrated = 0;
    let programsCreated = 0;
    let errors: string[] = [];

    try {
      // Step 1: Get all existing phaseTemplates without programId (these are the original phases to migrate)
      const allPhaseTemplates = await ctx.db.query("phaseTemplates").collect();
      const phasesWithoutProgram = allPhaseTemplates.filter(p => !p.programId);

      // Step 2: Get all workoutTemplates without programId (global templates)
      const allTemplates = await ctx.db.query("workoutTemplates").collect();
      const globalTemplates = allTemplates.filter(t => !t.programId);

      // Step 3: Determine number of phases from existing phase templates or templates
      let numberOfPhases = 1;
      if (phasesWithoutProgram.length > 0) {
        const phasesSet = new Set(phasesWithoutProgram.map(p => p.phase));
        numberOfPhases = Math.max(...Array.from(phasesSet));
      } else if (globalTemplates.length > 0) {
        const phasesSet = new Set(globalTemplates.map(t => t.phase));
        numberOfPhases = Math.max(...Array.from(phasesSet));
      }

      // Step 4: Get all users who have workout logs or custom workout templates
      const allWorkoutLogs = await ctx.db.query("workoutLogs").collect();
      const customTemplates = await ctx.db.query("customWorkoutTemplates").collect();
      const userIds = new Set<string>();
      
      allWorkoutLogs.forEach(log => userIds.add(log.userId));
      customTemplates.forEach(t => userIds.add(t.userId));

      // If no users, still create a program for the first user when they appear
      // But for now, we need at least one user to proceed
      if (userIds.size === 0) {
        return {
          success: true,
          message: `Found ${phasesWithoutProgram.length} phases and ${globalTemplates.length} templates to migrate, but no users yet. Run migration again after user logs in.`,
          templatesCopied: 0,
          phasesMigrated: 0,
          programsCreated: 0,
          phasesToMigrate: phasesWithoutProgram.length,
          templatesToMigrate: globalTemplates.length,
        };
      }

      // Step 5: For each user, create a "Body By Rings Program" and migrate data
      for (const userId of userIds) {
        // Check if user already has an active program
        let existingProgram = await ctx.db
          .query("programs")
          .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
          .first();

        let programId;

        if (existingProgram) {
          // Deactivate existing program first
          await ctx.db.patch(existingProgram._id, { isActive: false });
        }

        // Create the "Body By Rings Program" as active
        programId = await ctx.db.insert("programs", {
          title: "Body By Rings Program",
          description: "A progressive calisthenics program focused on building strength with gymnastic rings.",
          numberOfPhases: numberOfPhases,
          isActive: true,
          userId: userId,
        });
        programsCreated++;

        // Step 6: Migrate existing phase templates to this program
        for (const phaseTemplate of phasesWithoutProgram) {
          try {
            await ctx.db.insert("phaseTemplates", {
              programId: programId,
              day: phaseTemplate.day,
              phase: phaseTemplate.phase,
              title: phaseTemplate.title,
              type: phaseTemplate.type,
            });
            phasesMigrated++;
          } catch (error) {
            errors.push(`Failed to migrate phase template for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        // Step 7: Copy all global templates to this user's program
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
            errors.push(`Failed to copy template for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }

      return {
        success: true,
        message: `Migration complete: Created ${programsCreated} "Body By Rings Program"(s), migrated ${phasesMigrated} phases, copied ${templatesCopied} templates`,
        templatesCopied,
        phasesMigrated,
        programsCreated,
        usersProcessed: userIds.size,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        templatesCopied,
        phasesMigrated,
        programsCreated,
        errors: errors.length > 0 ? errors : undefined,
      };
    }
  },
});
