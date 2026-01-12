import { db } from "@/db";
import { programBlueprints, blueprintRoutineBlocks } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * Data migration script to migrate existing single routine blocks
 * to the new blueprint_routine_blocks join table.
 *
 * This should be run once after applying the schema changes.
 */
export async function migrateToMultipleBlocks() {
  console.log("Starting migration of existing routine blocks to join table...");

  try {
    // Fetch all blueprints with existing routineBlockId
    const blueprints = await db
      .select()
      .from(programBlueprints)
      .where(sql`${programBlueprints.routineBlockId} IS NOT NULL`);

    console.log(`Found ${blueprints.length} blueprints with routine blocks to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    // Migrate each blueprint to join table
    for (const blueprint of blueprints) {
      if (blueprint.routineBlockId) {
        // Check if already migrated
        const existing = await db
          .select()
          .from(blueprintRoutineBlocks)
          .where(
            sql`${blueprintRoutineBlocks.blueprintId} = ${blueprint.id} AND ${blueprintRoutineBlocks.routineBlockId} = ${blueprint.routineBlockId}`
          )
          .limit(1);

        if (existing.length > 0) {
          skippedCount++;
          continue;
        }

        await db.insert(blueprintRoutineBlocks).values({
          blueprintId: blueprint.id,
          routineBlockId: blueprint.routineBlockId,
          orderIndex: 0,
        });

        migratedCount++;
      }
    }

    console.log(`Migration complete:`);
    console.log(`  - Migrated: ${migratedCount} blueprints`);
    console.log(`  - Skipped (already migrated): ${skippedCount} blueprints`);
    console.log(`  - Total processed: ${blueprints.length} blueprints`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateToMultipleBlocks()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
