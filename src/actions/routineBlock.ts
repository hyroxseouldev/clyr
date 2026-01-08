"use server";

import { revalidatePath } from "next/cache";
import {
  getRoutineBlocksQuery,
  getRoutineBlockByIdQuery,
  createRoutineBlockQuery,
  updateRoutineBlockQuery,
  deleteRoutineBlockQuery,
  addRoutineItemQuery,
  updateRoutineItemOrderQuery,
  updateRoutineItemQuery,
  deleteRoutineItemQuery,
} from "@/db/queries/routineBlock";
import { getUserId } from "@/actions/auth";

/**
 * ==========================================
 * ROUTINE BLOCK ACTIONS
 * ==========================================
 */

/**
 * 루틴 블록 목록 조회 (페이지네이션)
 */
export async function getRoutineBlocksAction({
  page = 1,
  pageSize = 20,
  search,
  format,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  format?: string;
} = {}) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    const result = await getRoutineBlocksQuery({
      coachId: userId,
      page,
      pageSize,
      search,
      format,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("GET_ROUTINE_BLOCKS_ERROR", error);
    return {
      success: false,
      message: "루틴 블록을 불러오는데 실패했습니다.",
    };
  }
}

/**
 * 루틴 블록 상세 조회
 */
export async function getRoutineBlockByIdAction(id: string) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    const result = await getRoutineBlockByIdQuery(id);

    if (!result) {
      return {
        success: false,
        message: "루틴 블록을 찾을 수 없습니다.",
      };
    }

    // 코치 권한 확인
    if (result.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("GET_ROUTINE_BLOCK_ERROR", error);
    return {
      success: false,
      message: "루틴 블록을 불러오는데 실패했습니다.",
    };
  }
}

/**
 * 루틴 블록 생성
 */
export async function createRoutineBlockAction(data: {
  name: string;
  workoutFormat: string;
  targetValue?: string | null;
  isLeaderboardEnabled?: boolean;
  description?: string | null;
}) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    const block = await createRoutineBlockQuery({
      coachId: userId,
      ...data,
    });

    revalidatePath("/coach/dashboard/[pid]/workout-routine");
    return {
      success: true,
      data: block,
    };
  } catch (error) {
    console.error("CREATE_ROUTINE_BLOCK_ERROR", error);
    return {
      success: false,
      message: "루틴 블록 생성에 실패했습니다.",
    };
  }
}

/**
 * 루틴 블록 수정
 */
export async function updateRoutineBlockAction(
  id: string,
  data: {
    name?: string;
    workoutFormat?: string;
    targetValue?: string | null;
    isLeaderboardEnabled?: boolean;
    description?: string | null;
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
    // 권한 확인
    const existing = await getRoutineBlockByIdQuery(id);
    if (!existing || existing.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    const updated = await updateRoutineBlockQuery(id, data);

    revalidatePath("/coach/dashboard/[pid]/workout-routine");
    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("UPDATE_ROUTINE_BLOCK_ERROR", error);
    return {
      success: false,
      message: "루틴 블록 수정에 실패했습니다.",
    };
  }
}

/**
 * 루틴 블록 삭제
 */
export async function deleteRoutineBlockAction(id: string) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // 권한 확인
    const existing = await getRoutineBlockByIdQuery(id);
    if (!existing || existing.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    await deleteRoutineBlockQuery(id);

    revalidatePath("/coach/dashboard/[pid]/workout-routine");
    return {
      success: true,
    };
  } catch (error) {
    console.error("DELETE_ROUTINE_BLOCK_ERROR", error);
    return {
      success: false,
      message: "루틴 블록 삭제에 실패했습니다.",
    };
  }
}

/**
 * 루틴 아이템 추가
 */
export async function addRoutineItemAction(data: {
  blockId: string;
  libraryId: string;
  recommendation?: Record<string, unknown> | null;
}) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // 권한 확인
    const existing = await getRoutineBlockByIdQuery(data.blockId);
    if (!existing || existing.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    const item = await addRoutineItemQuery(data);

    revalidatePath("/coach/dashboard/[pid]/workout-routine");
    return {
      success: true,
      data: item,
    };
  } catch (error) {
    console.error("ADD_ROUTINE_ITEM_ERROR", error);
    return {
      success: false,
      message: "운동 추가에 실패했습니다.",
    };
  }
}

/**
 * 루틴 아이템 순서 업데이트
 */
export async function updateRoutineItemOrderAction(
  blockId: string,
  updates: Array<{ id: string; orderIndex: number }>
) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    // 권한 확인
    const existing = await getRoutineBlockByIdQuery(blockId);
    if (!existing || existing.coachId !== userId) {
      return {
        success: false,
        message: "접근 권한이 없습니다.",
      };
    }

    await updateRoutineItemOrderQuery(blockId, updates);

    revalidatePath("/coach/dashboard/[pid]/workout-routine");
    return {
      success: true,
    };
  } catch (error) {
    console.error("UPDATE_ROUTINE_ITEM_ORDER_ERROR", error);
    return {
      success: false,
      message: "순서 변경에 실패했습니다.",
    };
  }
}

/**
 * 루틴 아이템 업데이트
 */
export async function updateRoutineItemAction(
  id: string,
  data: {
    recommendation?: Record<string, unknown> | null;
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
    const updated = await updateRoutineItemQuery(id, data);

    revalidatePath("/coach/dashboard/[pid]/workout-routine");
    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("UPDATE_ROUTINE_ITEM_ERROR", error);
    return {
      success: false,
      message: "아이템 수정에 실패했습니다.",
    };
  }
}

/**
 * 루틴 아이템 삭제
 */
export async function deleteRoutineItemAction(id: string) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
    };
  }

  try {
    await deleteRoutineItemQuery(id);

    revalidatePath("/coach/dashboard/[pid]/workout-routine");
    return {
      success: true,
    };
  } catch (error) {
    console.error("DELETE_ROUTINE_ITEM_ERROR", error);
    return {
      success: false,
      message: "아이템 삭제에 실패했습니다.",
    };
  }
}
