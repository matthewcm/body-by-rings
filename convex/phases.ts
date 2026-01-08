
import { query } from "./_generated/server";

/**
 * This file defines the functions your frontend can call.
 * 'query' functions are for reading data.
 * 'mutation' functions are for writing or modifying data.
 */

export const get_phases = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get active program for the user
    const activeProgram = await ctx.db
      .query("programs")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", identity.subject).eq("isActive", true)
      )
      .first();

    if (!activeProgram) {
      return [];
    }

    // Get phases for the active program
    const allPhases = await ctx.db.query("phaseTemplates").collect();
    return allPhases.filter(p => p.programId === activeProgram._id);
  },
});
