"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import {
  createSectionRecordQuery,
  getSectionRecordByIdQuery,
  getSectionRecordsByUserIdQuery,
  updateSectionRecordQuery,
  deleteSectionRecordQuery,
  getSectionRecordsByProgramAndDayQuery,
} from "@/db/queries/section-records";
import { getEnrollmentsByUserIdQuery } from "@/db/queries/order";
import { getProgramByIdQuery } from "@/db/queries/program";
import { getSectionItemByIdQuery } from "@/db/queries/blueprint-sections";
import { getUserId } from "@/actions/auth";
import { db } from "@/db";
import { sectionRecords, userProfile } from "@/db/schema";

// ==========================================
// USER ACTIONS
// ==========================================

/**
 * 섹션 기록 생성 (숙제/설문 제출)
 * 유니크 제약: 같은 userId + sectionItemId 조합은 업데이트
 */
export async function createSectionRecordAction(data: {
  sectionId: string;
  sectionItemId: string;
  content: Record<string, unknown>;
}) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 프로그램 접근 권한 확인
    const sectionItem = await getSectionItemByIdQuery(data.sectionItemId);
    if (!sectionItem?.blueprint) {
      return { success: false, message: "섹션을 찾을 수 없습니다." };
    }

    const enrollments = await getEnrollmentsByUserIdQuery(userId);
    const hasAccess = enrollments.some(
      (e) => e.programId === sectionItem.blueprint!.programId
    );

    if (!hasAccess) {
      return { success: false, message: "권한이 없습니다." };
    }

    // Get user profile ID
    const profile = await db.query.userProfile.findFirst({
      where: eq(userProfile.accountId, userId),
    });

    if (!profile) {
      return { success: false, message: "프로필을 찾을 수 없습니다." };
    }

    // 기존 기록 확인 (userId + sectionItemId 유니크)
    const existingRecord = await db.query.sectionRecords.findFirst({
      where: and(
        eq(sectionRecords.userId, userId),
        eq(sectionRecords.sectionItemId, data.sectionItemId)
      ),
    });

    let record;
    if (existingRecord) {
      // 기존 기록 업데이트 (재도전)
      record = await updateSectionRecordQuery(existingRecord.id, {
        content: data.content,
        completedAt: new Date(),
      });
    } else {
      // 새 기록 생성
      record = await createSectionRecordQuery({
        userId: userId,
        userProfileId: profile.id,
        sectionId: data.sectionId,
        sectionItemId: data.sectionItemId,
        content: data.content,
        completedAt: new Date(),
      });
    }

    revalidatePath("/user/program");
    return {
      success: true,
      data: record,
    };
  } catch (error) {
    console.error("CREATE_SECTION_RECORD_ERROR", error);
    return { success: false, message: "제출에 실패했습니다." };
  }
}

/**
 * 내 섹션 기록 조회
 */
export async function getMySectionRecordsAction() {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const records = await getSectionRecordsByUserIdQuery(userId);

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error("GET_MY_SECTION_RECORDS_ERROR", error);
    return { success: false, message: "기록을 불러오는데 실패했습니다." };
  }
}

/**
 * 섹션 기록 상세 조회
 */
export async function getSectionRecordDetailAction(recordId: string) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const record = await getSectionRecordByIdQuery(recordId);

    if (!record) {
      return { success: false, message: "기록을 찾을 수 없습니다." };
    }

    // 소유자만 조회 가능
    if (record.userId !== userId) {
      return { success: false, message: "권한이 없습니다." };
    }

    return {
      success: true,
      data: record,
    };
  } catch (error) {
    console.error("GET_SECTION_RECORD_DETAIL_ERROR", error);
    return { success: false, message: "기록을 불러오는데 실패했습니다." };
  }
}

/**
 * 내 섹션 기록 수정 (재도전)
 */
export async function updateSectionRecordAction(
  recordId: string,
  data: {
    content?: Record<string, unknown>;
  }
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const record = await getSectionRecordByIdQuery(recordId);

    if (!record) {
      return { success: false, message: "기록을 찾을 수 없습니다." };
    }

    if (record.userId !== userId) {
      return { success: false, message: "권한이 없습니다." };
    }

    const updatedRecord = await updateSectionRecordQuery(recordId, {
      ...data,
      completedAt: new Date(), // 재도전 시 완료 시간 갱신
    });

    revalidatePath("/user/program");
    return {
      success: true,
      data: updatedRecord,
    };
  } catch (error) {
    console.error("UPDATE_SECTION_RECORD_ERROR", error);
    return { success: false, message: "수정에 실패했습니다." };
  }
}

/**
 * 내 섹션 기록 삭제
 */
export async function deleteSectionRecordAction(recordId: string) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const record = await getSectionRecordByIdQuery(recordId);

    if (!record) {
      return { success: false, message: "기록을 찾을 수 없습니다." };
    }

    if (record.userId !== userId) {
      return { success: false, message: "권한이 없습니다." };
    }

    await deleteSectionRecordQuery(recordId);

    revalidatePath("/user/program");
    return {
      success: true,
    };
  } catch (error) {
    console.error("DELETE_SECTION_RECORD_ERROR", error);
    return { success: false, message: "삭제에 실패했습니다." };
  }
}

// ==========================================
// COACH ACTIONS
// ==========================================

/**
 * 프로그램의 Phase-Day 섹션 기록 조회 (숙제 검토용)
 */
export async function getSectionRecordsByCoachAction(
  programId: string,
  phaseNumber: number,
  dayNumber: number
) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 프로그램 소유자 확인
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    const records = await getSectionRecordsByProgramAndDayQuery(
      programId,
      phaseNumber,
      dayNumber
    );

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error("GET_SECTION_RECORDS_BY_COACH_ERROR", error);
    return { success: false, message: "기록을 불러오는데 실패했습니다." };
  }
}

/**
 * 섹션 기록에 코치 코멘트 추가
 */
export async function updateCoachCommentOnSectionRecordAction(
  recordId: string,
  comment: string
) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const record = await getSectionRecordByIdQuery(recordId);

    if (!record) {
      return { success: false, message: "기록을 찾을 수 없습니다." };
    }

    // 코치 프로그램 소유자 확인
    const programId = record.sectionItem?.blueprint?.programId;
    if (!programId) {
      return { success: false, message: "프로그램을 찾을 수 없습니다." };
    }

    const program = await getProgramByIdQuery(programId);
    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    const updatedRecord = await updateSectionRecordQuery(recordId, {
      coachComment: comment || null,
    });

    revalidatePath("/coach/dashboard");
    return {
      success: true,
      data: updatedRecord,
    };
  } catch (error) {
    console.error("UPDATE_COACH_COMMENT_ON_SECTION_RECORD_ERROR", error);
    return { success: false, message: "코멘트 저장에 실패했습니다." };
  }
}

/**
 * 섹션 기록 삭제 (코치 권한)
 */
export async function deleteSectionRecordByCoachAction(recordId: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const record = await getSectionRecordByIdQuery(recordId);

    if (!record) {
      return { success: false, message: "기록을 찾을 수 없습니다." };
    }

    // 코치 프로그램 소유자 확인
    const programId = record.sectionItem?.blueprint?.programId;
    if (!programId) {
      return { success: false, message: "프로그램을 찾을 수 없습니다." };
    }

    const program = await getProgramByIdQuery(programId);
    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    await deleteSectionRecordQuery(recordId);

    revalidatePath("/coach/dashboard");
    return {
      success: true,
    };
  } catch (error) {
    console.error("DELETE_SECTION_RECORD_BY_COACH_ERROR", error);
    return { success: false, message: "삭제에 실패했습니다." };
  }
}
