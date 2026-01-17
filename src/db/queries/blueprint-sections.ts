import { db } from "@/db";
import { programBlueprints, blueprintSections, blueprintSectionItems } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

/**
 * ==========================================
 * BLUEPRINT SECTION QUERIES
 * ==========================================
 */

export interface BlueprintSectionWithOrder {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all sections for a blueprint (ordered)
 */
export async function getBlueprintSectionsQuery(
  blueprintId: string
): Promise<BlueprintSectionWithOrder[]> {
  const sections = await db
    .select({
      id: blueprintSections.id,
      title: blueprintSections.title,
      content: blueprintSections.content,
      orderIndex: blueprintSectionItems.orderIndex,
      createdAt: blueprintSections.createdAt,
      updatedAt: blueprintSections.updatedAt,
    })
    .from(blueprintSectionItems)
    .innerJoin(blueprintSections, eq(blueprintSectionItems.sectionId, blueprintSections.id))
    .where(eq(blueprintSectionItems.blueprintId, blueprintId))
    .orderBy(asc(blueprintSectionItems.orderIndex));

  return sections;
}

/**
 * Create a new section
 */
export async function createBlueprintSectionQuery(data: {
  title: string;
  content: string;
}) {
  const [section] = await db.insert(blueprintSections).values(data).returning();
  return section;
}

/**
 * Add section to blueprint
 */
export async function addSectionToBlueprintQuery(data: {
  blueprintId: string;
  sectionId: string;
  orderIndex: number;
}) {
  const [join] = await db.insert(blueprintSectionItems).values(data).returning();
  return join;
}

/**
 * Remove section from blueprint
 */
export async function removeSectionFromBlueprintQuery(
  blueprintId: string,
  sectionId: string
) {
  await db
    .delete(blueprintSectionItems)
    .where(
      and(
        eq(blueprintSectionItems.blueprintId, blueprintId),
        eq(blueprintSectionItems.sectionId, sectionId)
      )
    );
}

/**
 * Remove all sections from blueprint
 */
export async function removeSectionsFromBlueprintQuery(blueprintId: string) {
  await db
    .delete(blueprintSectionItems)
    .where(eq(blueprintSectionItems.blueprintId, blueprintId));
}

/**
 * Update section
 */
export async function updateBlueprintSectionQuery(
  id: string,
  data: {
    title?: string;
    content?: string;
  }
) {
  const [updated] = await db
    .update(blueprintSections)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(blueprintSections.id, id))
    .returning();
  return updated;
}

/**
 * Delete section (cascade will remove from join table)
 */
export async function deleteBlueprintSectionQuery(id: string) {
  await db.delete(blueprintSections).where(eq(blueprintSections.id, id));
}

/**
 * Update section order for blueprint
 */
export async function updateSectionOrderQuery(
  blueprintId: string,
  updates: Array<{ sectionId: string; orderIndex: number }>
) {
  await db.transaction(async (tx) => {
    for (const update of updates) {
      await tx
        .update(blueprintSectionItems)
        .set({ orderIndex: update.orderIndex })
        .where(
          and(
            eq(blueprintSectionItems.blueprintId, blueprintId),
            eq(blueprintSectionItems.sectionId, update.sectionId)
          )
        );
    }
  });
}
