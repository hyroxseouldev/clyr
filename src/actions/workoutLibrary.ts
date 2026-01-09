"use server";

import {
  getWorkoutLibraryQuery,
  getWorkoutLibraryByIdQuery,
  getWorkoutLibraryFiltersQuery,
} from "@/db/queries/workoutLibrary";

/**
 * ==========================================
 * WORKOUT LIBRARY ACTIONS
 * ==========================================
 */

/**
 * 워크아웃 라이브러리 조회 (페이지네이션 + 필터)
 */
export async function getWorkoutLibraryAction({
  page = 1,
  pageSize = 20,
  search,
  categories,
  workoutTypes,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  categories?: string[];
  workoutTypes?: string[];
} = {}) {
  try {
    const result = await getWorkoutLibraryQuery({
      page,
      pageSize,
      search,
      categories,
      workoutTypes,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("GET_WORKOUT_LIBRARY_ERROR", error);
    return {
      success: false,
      message: "워크아웃 라이브러리를 불러오는데 실패했습니다.",
    };
  }
}

/**
 * 워크아웃 라이브러리 상세 조회
 */
export async function getWorkoutLibraryByIdAction(id: string) {
  try {
    const result = await getWorkoutLibraryByIdQuery(id);

    if (!result) {
      return {
        success: false,
        message: "워크아웃을 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("GET_WORKOUT_LIBRARY_DETAIL_ERROR", error);
    return {
      success: false,
      message: "워크아웃을 불러오는데 실패했습니다.",
    };
  }
}

/**
 * 워크아웃 라이브러리 필터 옵션 조회
 */
export async function getWorkoutLibraryFiltersAction() {
  try {
    const result = await getWorkoutLibraryFiltersQuery();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("GET_WORKOUT_LIBRARY_FILTERS_ERROR", error);
    return {
      success: false,
      message: "필터 옵션을 불러오는데 실패했습니다.",
    };
  }
}
