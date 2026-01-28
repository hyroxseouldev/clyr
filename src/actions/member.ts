"use server";

import { revalidatePath } from "next/cache";
import {
  getMembersByProgramIdQuery,
  getMemberDetailQuery,
  getMemberWorkoutLogsByProgramQuery,
  getMemberCoachCommentsQuery,
  getMemberOrdersQuery,
  getMemberPRHistoryQuery,
  getMemberCurrentPRsQuery,
  getExpiringEnrollmentsQuery,
  getMemberStatsByProgramQuery,
  searchMembersQuery,
} from "@/db/queries/member";
import { getProgramByIdQuery } from "@/db/queries/program";
import { updateEnrollmentStatusQuery, updateEnrollmentStartDateQuery, updateEnrollmentEndDateQuery } from "@/db/queries/order";
import { getUserId } from "@/actions/auth";

/**
 * ==========================================
 * MEMBER LIST (회원 목록) ACTIONS
 * ==========================================
 */

/**
 * 프로그램의 회원 목록 조회
 */
export async function getMembersByProgramAction(programId: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 1. 프로그램 소유자 확인
    const program = await getProgramByIdQuery(programId);

    if (!program) {
      return { success: false, message: "프로그램을 찾을 수 없습니다." };
    }

    if (program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    // 2. 회원 목록 조회
    const members = await getMembersByProgramIdQuery(programId);

    return {
      success: true,
      data: members,
    };
  } catch (error) {
    console.error("GET_MEMBERS_BY_PROGRAM_ERROR", error);
    return { success: false, message: "회원 목록을 불러오는데 실패했습니다." };
  }
}

/**
 * 회원 검색
 */
export async function searchMembersAction(programId: string, searchTerm: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 1. 프로그램 소유자 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    // 2. 회원 검색
    const members = await searchMembersQuery(programId, searchTerm);

    return {
      success: true,
      data: members,
    };
  } catch (error) {
    console.error("SEARCH_MEMBERS_ERROR", error);
    return { success: false, message: "회원 검색에 실패했습니다." };
  }
}

/**
 * ==========================================
 * MEMBER DETAIL (회원 상세) ACTIONS
 * ==========================================
 */

/**
 * 회원 상세 정보 조회
 */
export async function getMemberDetailAction(programId: string, memberId: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 1. 프로그램 소유자 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    // 2. 회원 상세 조회
    const memberDetail = await getMemberDetailQuery(memberId, programId);

    if (!memberDetail) {
      return { success: false, message: "회원을 찾을 수 없습니다." };
    }

    return {
      success: true,
      data: memberDetail,
    };
  } catch (error) {
    console.error("GET_MEMBER_DETAIL_ERROR", error);
    return { success: false, message: "회원 정보를 불러오는데 실패했습니다." };
  }
}

/**
 * 회원의 운동 기록 조회
 */
export async function getMemberWorkoutLogsAction(programId: string, memberId: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 1. 프로그램 소유자 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    // 2. 운동 기록 조회
    const workoutLogs = await getMemberWorkoutLogsByProgramQuery(memberId, programId);

    return {
      success: true,
      data: workoutLogs,
    };
  } catch (error) {
    console.error("GET_MEMBER_WORKOUT_LOGS_ERROR", error);
    return { success: false, message: "운동 기록을 불러오는데 실패했습니다." };
  }
}

/**
 * 회원의 코치 코멘트 목록 조회
 */
export async function getMemberCoachCommentsAction(programId: string, memberId: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 1. 프로그램 소유자 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    // 2. 코치 코멘트 조회
    const comments = await getMemberCoachCommentsQuery(memberId, programId);

    return {
      success: true,
      data: comments,
    };
  } catch (error) {
    console.error("GET_MEMBER_COACH_COMMENTS_ERROR", error);
    return { success: false, message: "코치 코멘트를 불러오는데 실패했습니다." };
  }
}

/**
 * 회원의 구매 이력 조회
 */
export async function getMemberPurchaseHistoryAction(memberId: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 코치의 프로그램에 대한 구매 이력만 조회
    const orders = await getMemberOrdersQuery(memberId, coachId);

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("GET_MEMBER_PURCHASE_HISTORY_ERROR", error);
    return { success: false, message: "구매 이력을 불러오는데 실패했습니다." };
  }
}

/**
 * ==========================================
 * ENROLLMENT MANAGEMENT (수강 관리) ACTIONS
 * ==========================================
 */

/**
 * 회원 수강 상태 변경
 */
export async function updateEnrollmentStatusAction(
  enrollmentId: string,
  status: "ACTIVE" | "EXPIRED" | "PAUSED"
) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 권한 확인을 위해 enrollment를 먼저 조회 후 프로그램 소유자 확인
    // 현재는 간단하게 처리하고, 실제로는 enrollment를 통해 프로그램 ID를 가져와서 확인 필요

    const updatedEnrollment = await updateEnrollmentStatusQuery(enrollmentId, status);

    revalidatePath("/coach/dashboard");
    revalidatePath("/coach/members");

    return {
      success: true,
      data: updatedEnrollment,
      message: "수강 상태가 변경되었습니다.",
    };
  } catch (error) {
    console.error("UPDATE_ENROLLMENT_STATUS_ERROR", error);
    return { success: false, message: "수강 상태 변경에 실패했습니다." };
  }
}

/**
 * 회원 수강 기간 연장
 */
export async function extendEnrollmentAction(
  enrollmentId: string,
  endDate: string
) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    if (!endDate) {
      return { success: false, message: "종료일은 필수 항목입니다." };
    }

    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) {
      return { success: false, message: "유효하지 않은 날짜 형식입니다." };
    }

    const updatedEnrollment = await updateEnrollmentEndDateQuery(
      enrollmentId,
      parsedEndDate
    );

    revalidatePath("/coach/dashboard");
    revalidatePath("/coach/members");

    return {
      success: true,
      data: updatedEnrollment,
      message: "수강 기간이 연장되었습니다.",
    };
  } catch (error) {
    console.error("EXTEND_ENROLLMENT_ERROR", error);
    return { success: false, message: "수강 연장에 실패했습니다." };
  }
}

/**
 * 수강 시작일 업데이트
 */
export async function updateEnrollmentStartDateAction(
  enrollmentId: string,
  startDate: Date | null
) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const updatedEnrollment = await updateEnrollmentStartDateQuery(
      enrollmentId,
      startDate
    );

    revalidatePath("/coach/dashboard");
    revalidatePath("/coach/members");
    revalidatePath("/coach/dashboard/[pid]/members/[memberId]");

    return {
      success: true,
      data: updatedEnrollment,
      message: "시작일이 변경되었습니다.",
    };
  } catch (error) {
    console.error("UPDATE_ENROLLMENT_START_DATE_ERROR", error);
    return { success: false, message: "시작일 변경에 실패했습니다." };
  }
}

/**
 * 수강 종료일 업데이트
 */
export async function updateEnrollmentEndDateAction(
  enrollmentId: string,
  endDate: Date | null
) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const updatedEnrollment = await updateEnrollmentEndDateQuery(
      enrollmentId,
      endDate
    );

    revalidatePath("/coach/dashboard");
    revalidatePath("/coach/members");
    revalidatePath("/coach/dashboard/[pid]/members/[memberId]");

    return {
      success: true,
      data: updatedEnrollment,
      message: "종료일이 변경되었습니다.",
    };
  } catch (error) {
    console.error("UPDATE_ENROLLMENT_END_DATE_ERROR", error);
    return { success: false, message: "종료일 변경에 실패했습니다." };
  }
}

/**
 * ==========================================
 * PERFORMANCE & PR (퍼포먼스 & 기록) ACTIONS
 * ==========================================
 */

/**
 * 회원의 PR 기록 조회
 */
export async function getMemberPRHistoryAction(
  programId: string,
  memberId: string,
  libraryId?: string
) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 1. 프로그램 소유자 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    // 2. PR 기록 조회
    const prHistory = await getMemberPRHistoryQuery(memberId, programId, libraryId);

    return {
      success: true,
      data: prHistory,
    };
  } catch (error) {
    console.error("GET_MEMBER_PR_HISTORY_ERROR", error);
    return { success: false, message: "PR 기록을 불러오는데 실패했습니다." };
  }
}

/**
 * 회원의 현재 1RM 기록 조회
 */
export async function getMemberCurrentPRsAction(programId: string, memberId: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 1. 프로그램 소유자 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    // 2. 현재 PR 조회
    const currentPRs = await getMemberCurrentPRsQuery(memberId, programId);

    return {
      success: true,
      data: currentPRs,
    };
  } catch (error) {
    console.error("GET_MEMBER_CURRENT_PRS_ERROR", error);
    return { success: false, message: "현재 PR을 불러오는데 실패했습니다." };
  }
}

/**
 * ==========================================
 * MEMBER STATS (회원 통계) ACTIONS
 * ==========================================
 */

/**
 * 만료 임박 회원 목록 조회
 */
export async function getExpiringMembersAction(programId: string, daysUntilExpiry: number = 7) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 1. 프로그램 소유자 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    // 2. 만료 임박 회원 조회
    const expiringMembers = await getExpiringEnrollmentsQuery(programId, daysUntilExpiry);

    return {
      success: true,
      data: expiringMembers,
    };
  } catch (error) {
    console.error("GET_EXPIRING_MEMBERS_ERROR", error);
    return { success: false, message: "만료 임박 회원을 불러오는데 실패했습니다." };
  }
}

/**
 * 회원 수강 상태별 통계
 */
export async function getMemberStatsAction(programId: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 1. 프로그램 소유자 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    // 2. 회원 통계 조회
    const stats = await getMemberStatsByProgramQuery(programId);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("GET_MEMBER_STATS_ERROR", error);
    return { success: false, message: "회원 통계를 불러오는데 실패했습니다." };
  }
}
