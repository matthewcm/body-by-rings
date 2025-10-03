
import { query } from "./_generated/server";

/**
 * This file defines the functions your frontend can call.
 * 'query' functions are for reading data.
 * 'mutation' functions are for writing or modifying data.
 */

export const getPhases = query({
  handler: async (ctx) => {
    return ((await ctx.db.query("phaseTemplates").collect()))
  },
});
