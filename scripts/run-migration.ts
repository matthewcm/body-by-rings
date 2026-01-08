/**
 * Script to run the migration to populate exerciseCatalog
 * 
 * Usage: npx tsx scripts/run-migration.ts
 * 
 * Note: You need to have CONVEX_URL and CONVEX_AUTH_TOKEN environment variables set
 * Or use: npx convex run migrate_to_exercise_catalog:migrateToExerciseCatalog
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL or EXPO_PUBLIC_CONVEX_URL environment variable is required");
  process.exit(1);
}

async function runMigration() {
  const client = new ConvexHttpClient(CONVEX_URL);
  
  console.log("Starting migration to populate exerciseCatalog...");
  console.log(`Using Convex URL: ${CONVEX_URL}`);
  
  try {
    const result = await client.mutation(api.migrate_to_exercise_catalog.migrate_to_exercise_catalog, {});
    
    console.log("\n✅ Migration completed successfully!");
    console.log(`📊 Results:`);
    console.log(`   - Exercises created: ${result.catalogCreated}`);
    console.log(`   - Exercises updated: ${result.catalogUpdated}`);
    console.log(`   - Exercises skipped: ${result.skipped}`);
    if (result.message) {
      console.log(`\n📝 ${result.message}`);
    }
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error);
    process.exit(1);
  }
}

runMigration();
