"use server";

import { revalidatePath } from "next/cache";
import {
  createWeekQuery,
  getWeekByIdQuery,
  getWeeksByProgramIdQuery,
  updateWeekQuery,
  deleteWeekQuery,
  createWorkoutQuery,
  getWorkoutByIdQuery,
  getWorkoutsByWeekIdQuery,
  getWorkoutsByProgramIdQuery,
  updateWorkoutQuery,
  deleteWorkoutQuery,
  createSessionQuery,
  getSessionByIdQuery,
  getSessionsByWorkoutIdQuery,
  updateSessionQuery,
  deleteSessionQuery,
  reorderSessionsQuery,
  getFullProgramContentQuery,
} from "@/db/queries/workout";
import { getProgramFullCurriculumQuery } from "@/db/queries/program";
import { getUserId } from "@/actions/auth";

/**
 * 프로그램 소유자 확인 헬퍼 함수
 */
async function verifyProgramOwner(programId: string, userId: string) {
  const program = await getProgramFullCurriculumQuery(programId);
  if (!program) {
    return { success: false, message: "프로그램을 찾을 수 없습니다." };
  }
  if (program.coachId !== userId) {
    return { success: false, message: "권한이 없습니다." };
  }
  return { success: true, program };
}

/**
 * ==========================================
 * WEEK (주차) ACTIONS
 * ==========================================
 */

// 주차 생성 액션
export async function createWeekAction(
  programId: string,
  weekData: {
    weekNumber: number;
    title: string;
    description?: string | null;
  }
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const verify = await verifyProgramOwner(programId, userId);
    if (!verify.success) {
      return verify;
    }

    const newWeek = await createWeekQuery({
      programId,
      weekNumber: weekData.weekNumber,
      title: weekData.title,
      description: weekData.description ?? null,
    });

    revalidatePath(`/coach/dashboard/${programId}`);
    return {
      success: true,
      data: newWeek,
    };
  } catch (error) {
    console.error("CREATE_WEEK_ERROR", error);
    return { success: false, message: "주차 생성에 실패했습니다." };
  }
}

// 주차 수정 액션
export async function updateWeekAction(
  weekId: string,
  programId: string,
  updateData: {
    weekNumber?: number;
    title?: string;
    description?: string | null;
  }
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const verify = await verifyProgramOwner(programId, userId);
    if (!verify.success) {
      return verify;
    }

    const updatedWeek = await updateWeekQuery(weekId, updateData);

    revalidatePath(`/coach/dashboard/${programId}`);
    return {
      success: true,
      data: updatedWeek,
    };
  } catch (error) {
    console.error("UPDATE_WEEK_ERROR", error);
    return { success: false, message: "주차 수정에 실패했습니다." };
  }
}

// 주차 삭제 액션
export async function deleteWeekAction(weekId: string, programId: string) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const verify = await verifyProgramOwner(programId, userId);
    if (!verify.success) {
      return verify;
    }

    await deleteWeekQuery(weekId);

    revalidatePath(`/coach/dashboard/${programId}`);
    return { success: true };
  } catch (error) {
    console.error("DELETE_WEEK_ERROR", error);
    return { success: false, message: "주차 삭제에 실패했습니다." };
  }
}

/**
 * ==========================================
 * WORKOUT (일차) ACTIONS
 * ==========================================
 */

// 일차 생성 액션
export async function createWorkoutAction(
  programId: string,
  workoutData: {
    weekId: string;
    dayNumber: number;
    title: string;
  }
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const verify = await verifyProgramOwner(programId, userId);
    if (!verify.success) {
      return verify;
    }

    const newWorkout = await createWorkoutQuery({
      programId,
      weekId: workoutData.weekId,
      dayNumber: workoutData.dayNumber,
      title: workoutData.title,
    });

    revalidatePath(`/coach/dashboard/${programId}`);
    return {
      success: true,
      data: newWorkout,
    };
  } catch (error) {
    console.error("CREATE_WORKOUT_ERROR", error);
    return { success: false, message: "일차 생성에 실패했습니다." };
  }
}

// 일차 수정 액션
export async function updateWorkoutAction(
  workoutId: string,
  programId: string,
  updateData: {
    weekId?: string;
    dayNumber?: number;
    title?: string;
  }
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const verify = await verifyProgramOwner(programId, userId);
    if (!verify.success) {
      return verify;
    }

    const updatedWorkout = await updateWorkoutQuery(workoutId, updateData);

    revalidatePath(`/coach/dashboard/${programId}`);
    return {
      success: true,
      data: updatedWorkout,
    };
  } catch (error) {
    console.error("UPDATE_WORKOUT_ERROR", error);
    return { success: false, message: "일차 수정에 실패했습니다." };
  }
}

// 일차 삭제 액션
export async function deleteWorkoutAction(
  workoutId: string,
  programId: string
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const verify = await verifyProgramOwner(programId, userId);
    if (!verify.success) {
      return verify;
    }

    await deleteWorkoutQuery(workoutId);

    revalidatePath(`/coach/dashboard/${programId}`);
    return { success: true };
  } catch (error) {
    console.error("DELETE_WORKOUT_ERROR", error);
    return { success: false, message: "일차 삭제에 실패했습니다." };
  }
}

/**
 * ==========================================
 * SESSION (운동 상세) ACTIONS
 * ==========================================
 */

// 세션 생성 액션
export async function createSessionAction(
  programId: string,
  sessionData: {
    workoutId: string;
    title: string;
    content?: string | null;
    orderIndex?: number;
  }
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const verify = await verifyProgramOwner(programId, userId);
    if (!verify.success) {
      return verify;
    }

    const newSession = await createSessionQuery({
      workoutId: sessionData.workoutId,
      title: sessionData.title,
      content: sessionData.content ?? null,
      orderIndex: sessionData.orderIndex ?? 0,
    });

    revalidatePath(`/coach/dashboard/${programId}`);
    return {
      success: true,
      data: newSession,
    };
  } catch (error) {
    console.error("CREATE_SESSION_ERROR", error);
    return { success: false, message: "세션 생성에 실패했습니다." };
  }
}

// 세션 수정 액션
export async function updateSessionAction(
  sessionId: string,
  programId: string,
  updateData: {
    workoutId?: string;
    title?: string;
    content?: string | null;
    orderIndex?: number;
  }
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const verify = await verifyProgramOwner(programId, userId);
    if (!verify.success) {
      return verify;
    }

    const updatedSession = await updateSessionQuery(sessionId, updateData);

    revalidatePath(`/coach/dashboard/${programId}`);
    return {
      success: true,
      data: updatedSession,
    };
  } catch (error) {
    console.error("UPDATE_SESSION_ERROR", error);
    return { success: false, message: "세션 수정에 실패했습니다." };
  }
}

// 세션 삭제 액션
export async function deleteSessionAction(
  sessionId: string,
  programId: string
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const verify = await verifyProgramOwner(programId, userId);
    if (!verify.success) {
      return verify;
    }

    await deleteSessionQuery(sessionId);

    revalidatePath(`/coach/dashboard/${programId}`);
    return { success: true };
  } catch (error) {
    console.error("DELETE_SESSION_ERROR", error);
    return { success: false, message: "세션 삭제에 실패했습니다." };
  }
}

// 세션 순서 변경 액션
export async function reorderSessionsAction(
  programId: string,
  updates: { id: string; orderIndex: number }[]
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const verify = await verifyProgramOwner(programId, userId);
    if (!verify.success) {
      return verify;
    }

    await reorderSessionsQuery(updates);

    revalidatePath(`/coach/dashboard/${programId}`);
    return { success: true };
  } catch (error) {
    console.error("REORDER_SESSIONS_ERROR", error);
    return { success: false, message: "세션 순서 변경에 실패했습니다." };
  }
}

/**
 * ==========================================
 * READ (조회) ACTIONS
 * ==========================================
 */

// 프로그램의 전체 커리큘럼 조회 액션
export async function getFullProgramContentAction(programId: string) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const verify = await verifyProgramOwner(programId, userId);
    if (!verify.success) {
      return verify;
    }

    const content = await getFullProgramContentQuery(programId);

    return {
      success: true,
      data: content,
    };
  } catch (error) {
    console.error("GET_FULL_PROGRAM_CONTENT_ERROR", error);
    return {
      success: false,
      message: "프로그램 내용을 불러오는데 실패했습니다.",
    };
  }
}
