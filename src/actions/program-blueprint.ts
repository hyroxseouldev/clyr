"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { programBlueprints } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  getProgramPlanDataQuery,
  getProgramBlueprintByPhaseAndDayQuery,
  createProgramBlueprintQuery,
  updateProgramBlueprintQuery,
  deleteProgramBlueprintQuery,
  createPhaseBlueprintsQuery,
  deletePhaseBlueprintsQuery,
} from "@/db/queries/program-blueprint";
import { getProgramByIdQuery } from "@/db/queries/program";
import { getUserId } from "@/actions/auth";

/**
 * ==========================================
 * PROGRAM BLUEPRINT ACTIONS
 * ==========================================
 */

/**
 * 프로그램 플랜 데이터 조회 (페이즈별로 그룹화된 블루프린트)
 */
export async function getProgramPlanDataAction(programId: string) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // 프로그램 권한 확인
    const program = await getProgramByIdQuery(programId);

    if (!program) {
      return {
        success: false,
        message: "프로그램을 찾을 수 없습니다.",
      };
    }

    if (program.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    const planData = await getProgramPlanDataQuery(programId);

    if (!planData) {
      return {
        success: false,
        message: "플랜 데이터를 불러오는데 실패했습니다.",
      };
    }

    return {
      success: true,
      data: planData,
    };
  } catch (error) {
    console.error("GET_PROGRAM_PLAN_DATA_ERROR", error);
    return {
      success: false,
      message: "플랜 데이터를 불러오는데 실패했습니다.",
    };
  }
}

/**
 * 특정 일차의 블루프린트 조회
 */
export async function getProgramBlueprintByPhaseAndDayAction(
  programId: string,
  phaseNumber: number,
  dayNumber: number
) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // 프로그램 권한 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    const blueprint = await getProgramBlueprintByPhaseAndDayQuery(
      programId,
      phaseNumber,
      dayNumber
    );

    return {
      success: true,
      data: blueprint,
    };
  } catch (error) {
    console.error("GET_PROGRAM_BLUEPRINT_ERROR", error);
    return {
      success: false,
      message: "블루프린트를 불러오는데 실패했습니다.",
    };
  }
}

/**
 * 프로그램 블루프린트 생성
 */
export async function createProgramBlueprintAction(data: {
  programId: string;
  phaseNumber: number;
  dayNumber: number;
  dayTitle?: string | null;
  notes?: string | null;
}) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // 프로그램 권한 확인
    const program = await getProgramByIdQuery(data.programId);

    if (!program || program.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    const blueprint = await createProgramBlueprintQuery(data);

    revalidatePath("/coach/dashboard/[pid]/plan");
    return {
      success: true,
      data: blueprint,
    };
  } catch (error) {
    console.error("CREATE_PROGRAM_BLUEPRINT_ERROR", error);
    return {
      success: false,
      message: "블루프린트 생성에 실패했습니다.",
    };
  }
}

/**
 * 프로그램 블루프린트 수정
 */
export async function updateProgramBlueprintAction(
  id: string,
  data: {
    dayTitle?: string | null;
    notes?: string | null;
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
    // Update basic fields
    const updated = await updateProgramBlueprintQuery(id, {
      dayTitle: data.dayTitle,
      notes: data.notes,
    });

    revalidatePath("/coach/dashboard/[pid]/plan");
    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("UPDATE_PROGRAM_BLUEPRINT_ERROR", error);
    return {
      success: false,
      message: "블루프린트 수정에 실패했습니다.",
    };
  }
}

/**
 * 프로그램 블루프린트 삭제
 */
export async function deleteProgramBlueprintAction(id: string, programId: string) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // 프로그램 권한 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    await deleteProgramBlueprintQuery(id);

    revalidatePath("/coach/dashboard/[pid]/plan");
    return {
      success: true,
    };
  } catch (error) {
    console.error("DELETE_PROGRAM_BLUEPRINT_ERROR", error);
    return {
      success: false,
      message: "블루프린트 삭제에 실패했습니다.",
    };
  }
}

/**
 * 페이즈 생성 (일괄 블루프린트 생성)
 */
export async function createPhaseAction(data: {
  programId: string;
  phaseNumber: number;
  dayCount: number;
}) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // 프로그램 권한 확인
    const program = await getProgramByIdQuery(data.programId);

    if (!program || program.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    const blueprints = await createPhaseBlueprintsQuery(
      data.programId,
      data.phaseNumber,
      data.dayCount
    );

    revalidatePath("/coach/dashboard/[pid]/plan");
    return {
      success: true,
      data: blueprints,
    };
  } catch (error) {
    console.error("CREATE_PHASE_ERROR", error);
    return {
      success: false,
      message: "페이즈 생성에 실패했습니다.",
    };
  }
}

/**
 * 페이즈 삭제 (일괄 블루프린트 삭제)
 */
export async function deletePhaseAction(
  programId: string,
  phaseNumber: number
) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // 프로그램 권한 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    await deletePhaseBlueprintsQuery(programId, phaseNumber);

    revalidatePath("/coach/dashboard/[pid]/plan");
    return {
      success: true,
    };
  } catch (error) {
    console.error("DELETE_PHASE_ERROR", error);
    return {
      success: false,
      message: "페이즈 삭제에 실패했습니다.",
    };
  }
}

/**
 * 페이즈에 일차 추가
 */
export async function addDayToPhaseAction(data: {
  programId: string;
  phaseNumber: number;
}) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 프로그램 권한 확인
    const program = await getProgramByIdQuery(data.programId);
    if (!program || program.coachId !== userId) {
      return { success: false, message: "접근 권한이 없습니다." };
    }

    // 현재 페이즈의 마지막 일차 조회
    const blueprints = await db
      .select()
      .from(programBlueprints)
      .where(
        and(
          eq(programBlueprints.programId, data.programId),
          eq(programBlueprints.phaseNumber, data.phaseNumber)
        )
      )
      .orderBy(desc(programBlueprints.dayNumber))
      .limit(1);

    const lastDayNumber = blueprints[0]?.dayNumber || 0;
    const newDayNumber = lastDayNumber + 1;

    // 최대 7일 제한
    if (newDayNumber > 7) {
      return { success: false, message: "최대 7일까지 추가 가능합니다." };
    }

    const blueprint = await createProgramBlueprintQuery({
      programId: data.programId,
      phaseNumber: data.phaseNumber,
      dayNumber: newDayNumber,
    });

    revalidatePath("/coach/dashboard/[pid]/plan");
    return { success: true, data: blueprint };
  } catch (error) {
    console.error("ADD_DAY_ERROR", error);
    return { success: false, message: "일차 추가에 실패했습니다." };
  }
}
