"use server";

import { revalidatePath } from "next/cache";
import {
  createWorkoutLogQuery,
  getWorkoutLogByIdQuery,
  getWorkoutLogsByUserIdQuery,
  getWorkoutLogsByUserIdAndProgramIdQuery,
  updateWorkoutLogQuery,
  deleteWorkoutLogQuery,
  getHomeworkSubmissionsByProgramAndDayQuery,
  getHomeworkLeaderboardByProgramAndDayQuery,
  getHomeworkStatsByProgramQuery,
} from "@/db/queries/workout-log";
import { getEnrollmentsByUserIdQuery } from "@/db/queries/order";
import { getProgramByIdQuery } from "@/db/queries/program";
import { db } from "@/db";
import { programBlueprints } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserId } from "@/actions/auth";

/**
 * ==========================================
 * USER ACTIONS (사용자)
 * ==========================================
 */

/**
 * 운동 일지 생성
 */
export async function createWorkoutLogAction(data: {
  libraryId: string;
  blueprintId?: string | null;
  logDate: Date;
  content: Record<string, unknown>;
  intensity: "LOW" | "MEDIUM" | "HIGH";
}) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const newLog = await createWorkoutLogQuery({
      userId: userId,
      libraryId: data.libraryId,
      blueprintId: data.blueprintId,
      logDate: data.logDate,
      content: data.content,
      intensity: data.intensity,
    });

    revalidatePath("/user/workout-logs");
    return {
      success: true,
      data: newLog,
    };
  } catch (error) {
    console.error("CREATE_WORKOUT_LOG_ERROR", error);
    return { success: false, message: "운동 일지 생성에 실패했습니다." };
  }
}

/**
 * 내 운동 일지 목록 조회
 */
export async function getMyWorkoutLogsAction() {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const logs = await getWorkoutLogsByUserIdQuery(userId);

    return {
      success: true,
      data: logs,
    };
  } catch (error) {
    console.error("GET_MY_WORKOUT_LOGS_ERROR", error);
    return { success: false, message: "운동 일지를 불러오는데 실패했습니다." };
  }
}

/**
 * 운동 일지 상세 조회
 */
export async function getWorkoutLogDetailAction(logId: string) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const log = await getWorkoutLogByIdQuery(logId);

    if (!log) {
      return { success: false, message: "운동 일지를 찾을 수 없습니다." };
    }

    // 본인의 일지만 조회 가능
    if (log.userId !== userId) {
      return { success: false, message: "권한이 없습니다." };
    }

    return {
      success: true,
      data: log,
    };
  } catch (error) {
    console.error("GET_WORKOUT_LOG_DETAIL_ERROR", error);
    return { success: false, message: "운동 일지를 불러오는데 실패했습니다." };
  }
}

/**
 * 운동 일지 수정
 */
export async function updateWorkoutLogAction(
  logId: string,
  data: {
    title?: string;
    logDate?: Date;
    content?: Record<string, unknown>;
    intensity?: "LOW" | "MEDIUM" | "HIGH";
  }
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 일지 소유자 확인
    const log = await getWorkoutLogByIdQuery(logId);

    if (!log) {
      return { success: false, message: "운동 일지를 찾을 수 없습니다." };
    }

    if (log.userId !== userId) {
      return { success: false, message: "권한이 없습니다." };
    }

    const updatedLog = await updateWorkoutLogQuery(logId, data);

    revalidatePath("/user/workout-logs");
    return {
      success: true,
      data: updatedLog,
    };
  } catch (error) {
    console.error("UPDATE_WORKOUT_LOG_ERROR", error);
    return { success: false, message: "운동 일지 수정에 실패했습니다." };
  }
}

/**
 * 운동 일지 삭제
 */
export async function deleteWorkoutLogAction(logId: string) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 일지 소유자 확인
    const log = await getWorkoutLogByIdQuery(logId);

    if (!log) {
      return { success: false, message: "운동 일지를 찾을 수 없습니다." };
    }

    if (log.userId !== userId) {
      return { success: false, message: "권한이 없습니다." };
    }

    await deleteWorkoutLogQuery(logId);

    revalidatePath("/user/workout-logs");
    return {
      success: true,
    };
  } catch (error) {
    console.error("DELETE_WORKOUT_LOG_ERROR", error);
    return { success: false, message: "운동 일지 삭제에 실패했습니다." };
  }
}

/**
 * ==========================================
 * COACH ACTIONS (코치 전용)
 * ==========================================
 */

/**
 * 코치용: 회원의 운동 일지 조회
 * (코치의 프로그램에 수강 중인 회원의 일지만 조회 가능)
 */
export async function getMemberWorkoutLogsByCoachAction(memberUserId: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 코치의 프로그램 목록 조회
    // 회원이 수강 중인 프로그램이 코치의 프로그램인지 확인

    // 회원의 수강 프로그램 목록 조회
    const enrollments = await getEnrollmentsByUserIdQuery(memberUserId);

    if (enrollments.length === 0) {
      return {
        success: true,
        data: [], // 수강 중인 프로그램 없음
      };
    }

    // 코치의 프로그램 ID 목록 확인을 위해
    // 각 enrollment의 program을 조회해서 coachId 확인
    const coachProgramIds: string[] = [];

    for (const enrollment of enrollments) {
      const program = await getProgramByIdQuery(enrollment.programId);
      if (program && program.coachId === coachId) {
        coachProgramIds.push(enrollment.programId);
      }
    }

    // 코치의 프로그램에 수강 중인 회원이 아니면 접근 거부
    if (coachProgramIds.length === 0) {
      return { success: false, message: "권한이 없습니다." };
    }

    // 회원의 운동 일지 조회
    const logs = await getWorkoutLogsByUserIdQuery(memberUserId);

    return {
      success: true,
      data: logs,
    };
  } catch (error) {
    console.error("GET_MEMBER_WORKOUT_LOGS_BY_COACH_ERROR", error);
    return { success: false, message: "회원 운동 일지를 불러오는데 실패했습니다." };
  }
}

/**
 * 코치용: 회원 운동 일지 페이지 데이터 조회 (통합)
 * (프로그램 소유자 확인, 회원 확인, 운동 일지 조회를 한번에 처리)
 */
export async function getMemberWorkoutLogsPageDataAction(programId: string, memberUserId: string) {
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

    // 2. 회원이 해당 프로그램에 수강 중인지 확인
    const enrollments = await getEnrollmentsByUserIdQuery(memberUserId);
    const memberEnrollment = enrollments.find((e) => e.programId === programId);

    if (!memberEnrollment) {
      return { success: false, message: "수강생을 찾을 수 없습니다." };
    }

    // 3. 회원의 해당 프로그램 운동 일지 조회
    const logs = await getWorkoutLogsByUserIdAndProgramIdQuery(memberUserId, programId);

    return {
      success: true,
      data: {
        member: {
          id: memberEnrollment.user.id,
          email: memberEnrollment.user.email,
          fullName: memberEnrollment.user.fullName,
          avatarUrl: memberEnrollment.user.avatarUrl,
        },
        logs,
      },
    };
  } catch (error) {
    console.error("GET_MEMBER_WORKOUT_LOGS_PAGE_DATA_ERROR", error);
    return { success: false, message: "데이터를 불러오는데 실패했습니다." };
  }
}

/**
 * ==========================================
 * HOMEWORK MANAGEMENT (숙제 관리) ACTIONS
 * ==========================================
 */

/**
 * 숙제 관리 페이지 데이터 조회
 * 프로그램의 숙제 통계와 Day별 제출 현황
 */
export async function getHomeworkPageDataAction(programId: string) {
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

    // 2. 숙제 통계 조회
    const stats = await getHomeworkStatsByProgramQuery(programId);

    // 3. program blueprints 조회하여 Day 목록 추출 (Phase-Day 형태)
    const blueprints = await db.query.programBlueprints.findMany({
      where: eq(programBlueprints.programId, programId),
      orderBy: [programBlueprints.phaseNumber, programBlueprints.dayNumber],
    });

    // Phase-Day 형태로 변환 (예: P1-D1, P1-D2, P2-D1...)
    const phaseDayMap = blueprints.map((bp) => ({
      phaseNumber: bp.phaseNumber,
      dayNumber: bp.dayNumber,
      label: `P${bp.phaseNumber}-D${bp.dayNumber}`,
    }));

    return {
      success: true,
      data: {
        program: {
          id: program.id,
          title: program.title,
          totalWeeks: program.durationWeeks,
        },
        stats,
        availableDays: phaseDayMap, // Phase-Day 형태로 반환
      },
    };
  } catch (error) {
    console.error("GET_HOMEWORK_PAGE_DATA_ERROR", error);
    return { success: false, message: "데이터를 불러오는데 실패했습니다." };
  }
}

/**
 * 특정 Phase-Day의 숙제 제출 목록 조회 (리더보드 포함)
 */
export async function getHomeworkSubmissionsAction(
  programId: string,
  phaseNumber: number,
  dayNumber: number
) {
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

    // 2. 리더보드 정렬이 적용된 제출 목록 조회
    const submissions = await getHomeworkLeaderboardByProgramAndDayQuery(
      programId,
      phaseNumber,
      dayNumber
    );

    return {
      success: true,
      data: submissions,
    };
  } catch (error) {
    console.error("GET_HOMEWORK_SUBMISSIONS_ERROR", error);
    return { success: false, message: "숙제 제출 목록을 불러오는데 실패했습니다." };
  }
}

/**
 * 코치 코멘트 추가/수정
 */
export async function updateCoachCommentAction(logId: string, comment: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 일지 존재 확인
    const log = await getWorkoutLogByIdQuery(logId);

    if (!log) {
      return { success: false, message: "운동 일지를 찾을 수 없습니다." };
    }

    // 코치 권한 확인 (해당 일지의 프로그램 소유자인지)
    if (log.blueprint?.programId) {
      const program = await getProgramByIdQuery(log.blueprint.programId);

      if (!program || program.coachId !== coachId) {
        return { success: false, message: "권한이 없습니다." };
      }
    }

    // 코멘트 업데이트
    const updatedLog = await updateWorkoutLogQuery(logId, {
      coachComment: comment || null,
    });

    revalidatePath("/coach/dashboard");
    return {
      success: true,
      data: updatedLog,
    };
  } catch (error) {
    console.error("UPDATE_COACH_COMMENT_ERROR", error);
    return { success: false, message: "코멘트 저장에 실패했습니다." };
  }
}

/**
 * 코치 확인 완료 처리
 */
export async function toggleCoachCheckAction(logId: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 일지 존재 확인
    const log = await getWorkoutLogByIdQuery(logId);

    if (!log) {
      return { success: false, message: "운동 일지를 찾을 수 없습니다." };
    }

    // 코치 권한 확인
    if (log.blueprint?.programId) {
      const program = await getProgramByIdQuery(log.blueprint.programId);

      if (!program || program.coachId !== coachId) {
        return { success: false, message: "권한이 없습니다." };
      }
    }

    // 확인 상태 토글
    const updatedLog = await updateWorkoutLogQuery(logId, {
      isCheckedByCoach: !log.isCheckedByCoach,
    });

    revalidatePath("/coach/dashboard");
    return {
      success: true,
      data: updatedLog,
    };
  } catch (error) {
    console.error("TOGGLE_COACH_CHECK_ERROR", error);
    return { success: false, message: "확인 처리에 실패했습니다." };
  }
}
