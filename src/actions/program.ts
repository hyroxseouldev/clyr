"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProgramWithWeeksQuery,
  updateProgramQuery,
  deleteProgramQuery,
} from "@/db/queries";

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
