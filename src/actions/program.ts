"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProgramWithWeeksQuery,
  updateProgramQuery,
  deleteProgramQuery,
  getProgramsByCoachQuery,
} from "@/db/queries";
import { createClient } from "@/lib/supabase/server";

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
  try {
    const newProgram = await createProgramWithWeeksQuery(
      programData,
      weeksData
    );

    revalidatePath("/dashboard/programs");
    return { success: true, id: newProgram.id };
  } catch (error) {
    return { success: false, message: "프로그램 생성에 실패했습니다." };
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

    revalidatePath("/dashboard/programs");
    // 리스트 페이지로 이동시키고 싶다면 redirect 사용
    // redirect("/dashboard/programs");
    return { success: true };
  } catch (error) {
    return { success: false, message: "삭제에 실패했습니다." };
  }
}
