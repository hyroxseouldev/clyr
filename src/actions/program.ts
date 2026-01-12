"use server";

import { revalidatePath } from "next/cache";
import {
  createProgramWithWeeksQuery,
  updateProgramQuery,
  deleteProgramQuery,
  getProgramsByCoachQuery,
  getProgramFullCurriculumQuery,
  getProgramWithWeeksBySlugQuery,
} from "@/db/queries";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/actions/auth";

/**
 * [READ] 현재 로그인한 유저(코치)의 프로그램 목록 가져오기
 */
export async function getMyProgramsAction() {
  try {
    const supabase = await createClient();

    // 1. Supabase 서버 세션에서 유저 정보 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "인증되지 않은 사용자입니다." };
    }

    // 2. 해당 유저 ID로 쿼리 실행
    const data = await getProgramsByCoachQuery(user.id);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("GET_MY_PROGRAMS_ERROR", error);
    return { success: false, message: "데이터 로딩 실패" };
  }
}

// 프로그램 생성 액션
export async function createProgramAction(programData: any, weeksData: any[]) {
  // 유저 ID ? 넣어야 되는데
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "unauthorized" };
  }
  try {
    const newProgram = await createProgramWithWeeksQuery(
      { ...programData, coachId: userId },
      weeksData
    );

    revalidatePath("/dashboard/programs");
    return { success: true, id: newProgram.id };
  } catch (error) {
    return { success: false, message: "createFailed" };
  }
}

// 프로그램 수정 액션
export async function updateProgramAction(programId: string, updateData: any) {
  try {
    await updateProgramQuery(programId, updateData);

    revalidatePath(`/dashboard/programs/${programId}`);
    revalidatePath("/dashboard/programs");
    return { success: true };
  } catch (error) {
    return { success: false, message: "수정에 실패했습니다." };
  }
}

// 프로그램 삭제 액션
export async function deleteProgramAction(programId: string) {
  try {
    await deleteProgramQuery(programId);

    revalidatePath("/coach/dashboard");
    revalidatePath(`/coach/dashboard/${programId}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: "deleteFailed" };
  }
}

// 프로그램 ID로 프로그램 정보 가져오기
export async function getProgramByIdAction(programId: string) {
  try {
    const program = await getProgramFullCurriculumQuery(programId);

    if (!program) {
      return { success: false, message: "프로그램을 찾을 수 없습니다." };
    }

    return {
      success: true,
      data: program,
    };
  } catch (error) {
    console.error("GET_PROGRAM_BY_ID_ERROR", error);
    return {
      success: false,
      message: "프로그램 정보를 불러오는데 실패했습니다.",
    };
  }
}

// 프로그램 slug 로 프로그램 정보 가져오기
export async function getProgramBySlugAction(slug: string) {
  try {
    const program = await getProgramWithWeeksBySlugQuery(slug);

    if (!program) {
      return { success: false, message: "프로그램을 찾을 수 없습니다." };
    }

    return { success: true, data: program };
  } catch (error) {
    console.error("GET_PROGRAM_BY_SLUG_ERROR", error);
    return {
      success: false,
      message: "프로그램 정보를 불러오는데 실패했습니다.",
    };
  }
}
