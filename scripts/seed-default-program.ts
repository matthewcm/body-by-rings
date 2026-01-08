/**
 * Script to manually seed the default "Body By Rings" program
 * 
 * IMPORTANT: This requires authentication, so it must be run from a context where
 * you're logged in. Use one of these methods:
 * 
 * Method 1: Run from Convex Dashboard
 * - Go to your Convex dashboard
 * - Navigate to Functions > seed_default_program > ensure_default_program
 * - Click "Run" (this will use your logged-in session)
 * 
 * Method 2: Call from the app
 * - The plan screen automatically calls this when you have no programs
 * - Or add a button to manually trigger it
 * 
 * Method 3: Use Convex CLI (if you have auth token)
 * npx convex run seed_default_program:ensure_default_program
 * 
 * Note: This mutation requires authentication and will only work for the logged-in user
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL or EXPO_PUBLIC_CONVEX_URL environment variable is required");
  process.exit(1);
}

async function seedDefaultProgram() {
  const client = new ConvexHttpClient(CONVEX_URL);
  
  console.log("Attempting to seed default program...");
  console.log(`Using Convex URL: ${CONVEX_URL}`);
  console.log("\n⚠️  NOTE: This requires authentication.");
  console.log("   If you're not logged in, you'll need to:");
  console.log("   1. Use the Convex Dashboard (Functions tab)");
  console.log("   2. Or call it from within the app (Plan screen)");
  console.log("   3. Or ensure you have a valid auth token\n");
  
  try {
    const result = await client.mutation(api.seed_default_program.ensure_default_program, {});
    
    if (result.success) {
      console.log("\n✅ Default program seeded successfully!");
      console.log(`📝 ${result.message}`);
      if (result.programId) {
        console.log(`🆔 Program ID: ${result.programId}`);
      }
    } else {
      console.log("\n⚠️  Seed operation completed:");
      console.log(`📝 ${result.message}`);
    }
  } catch (error: any) {
    if (error?.message?.includes("logged in") || error?.message?.includes("authentication")) {
      console.error("\n❌ Authentication required!");
      console.error("   This mutation requires you to be logged in.");
      console.error("   Please use one of these methods:");
      console.error("   1. Run from Convex Dashboard (Functions > seed_default_program > ensure_default_program)");
      console.error("   2. Add a button in the app to trigger it");
      console.error("   3. It will auto-run when you visit the Plan screen with no programs");
    } else {
      console.error("\n❌ Seed operation failed:");
      console.error(error);
    }
    process.exit(1);
  }
}

seedDefaultProgram();
