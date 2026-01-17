"use server";

import { revalidatePath } from "next/cache";
import {
  getBlueprintSectionsQuery,
  createBlueprintSectionQuery,
  addSectionToBlueprintQuery,
  updateBlueprintSectionQuery,
  deleteBlueprintSectionQuery,
  updateSectionOrderQuery,
} from "@/db/queries/blueprint-sections";
import { getProgramByIdQuery } from "@/db/queries/program";
import { getUserId } from "@/actions/auth";

/**
 * ==========================================
 * BLUEPRINT SECTION ACTIONS
 * ==========================================
 */

/**
 * Get all sections for a blueprint
 */
export async function getBlueprintSectionsAction(blueprintId: string) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    const sections = await getBlueprintSectionsQuery(blueprintId);

    return {
      success: true,
      data: sections,
    };
  } catch (error) {
    console.error("GET_BLUEPRINT_SECTIONS_ERROR", error);
    return {
      success: false,
      message: "섹션을 불러오는데 실패했습니다.",
    };
  }
}

/**
 * Create section and add to blueprint
 */
export async function createBlueprintSectionAction(data: {
  blueprintId: string;
  programId: string;
  title: string;
  content: string;
}) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // Verify program ownership
    const program = await getProgramByIdQuery(data.programId);

    if (!program || program.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    // Get current sections count for order
    const existingSections = await getBlueprintSectionsQuery(data.blueprintId);

    // Create section
    const section = await createBlueprintSectionQuery({
      title: data.title,
      content: data.content,
    });

    // Add to blueprint
    await addSectionToBlueprintQuery({
      blueprintId: data.blueprintId,
      sectionId: section.id,
      orderIndex: existingSections.length,
    });

    revalidatePath("/coach/dashboard/[pid]/plan");
    return {
      success: true,
      data: section,
    };
  } catch (error) {
    console.error("CREATE_BLUEPRINT_SECTION_ERROR", error);
    return {
      success: false,
      message: "섹션 생성에 실패했습니다.",
    };
  }
}

/**
 * Update section
 */
export async function updateBlueprintSectionAction(
  id: string,
  data: {
    title?: string;
    content?: string;
  }
) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    const updated = await updateBlueprintSectionQuery(id, data);

    revalidatePath("/coach/dashboard/[pid]/plan");
    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("UPDATE_BLUEPRINT_SECTION_ERROR", error);
    return {
      success: false,
      message: "섹션 수정에 실패했습니다.",
    };
  }
}

/**
 * Delete section
 */
export async function deleteBlueprintSectionAction(
  id: string,
  blueprintId: string,
  programId: string
) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // Verify program ownership
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    await deleteBlueprintSectionQuery(id);

    revalidatePath("/coach/dashboard/[pid]/plan");
    return {
      success: true,
    };
  } catch (error) {
    console.error("DELETE_BLUEPRINT_SECTION_ERROR", error);
    return {
      success: false,
      message: "섹션 삭제에 실패했습니다.",
    };
  }
}

/**
 * Reorder sections
 */
export async function reorderBlueprintSectionsAction(data: {
  blueprintId: string;
  programId: string;
  sectionIds: string[];
}) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // Verify program ownership
    const program = await getProgramByIdQuery(data.programId);

    if (!program || program.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    // Update order
    const updates = data.sectionIds.map((sectionId, index) => ({
      sectionId,
      orderIndex: index,
    }));

    await updateSectionOrderQuery(data.blueprintId, updates);

    revalidatePath("/coach/dashboard/[pid]/plan");
    return {
      success: true,
    };
  } catch (error) {
    console.error("REORDER_BLUEPRINT_SECTIONS_ERROR", error);
    return {
      success: false,
      message: "섹션 순서 변경에 실패했습니다.",
    };
  }
}
