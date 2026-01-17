import { eq, desc } from "drizzle-orm";
import {
  programs,
  enrollments,
} from "@/db/schema";
import { db } from "@/db"; // 설정된 db 인스턴스

/**
 * ==========================================
 * PROGRAM QUERIES
 * ==========================================
 */

/**
 * 특정 코치가 등록한 모든 프로그램 목록 조회
 * @param coachId - 코치의 account ID
 */
export const getProgramsByCoachQuery = async (coachId: string) => {
  return await db.query.programs.findMany({
    where: eq(programs.coachId, coachId),
    orderBy: [desc(programs.createdAt)],
  });
};

/**
 * ID로 프로그램 조회
 * @param programId - 프로그램 ID
 */
export const getProgramByIdQuery = async (programId: string) => {
  return await db.query.programs.findFirst({
    where: eq(programs.id, programId),
  });
};

export const updateProgramQuery = async (
  programId: string,
  updateData: any
) => {
  return await db
    .update(programs)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(programs.id, programId))
    .returning();
};

export const deleteProgramQuery = async (programId: string) => {
  return await db
    .delete(programs)
    .where(eq(programs.id, programId))
    .returning();
};

// 프로그램 slug 로 프로그램 정보 가져오기
// 코치 정보도 함께 들어갑니다
export const getProgramBySlugQuery = async (slug: string) => {
  return await db.query.programs.findFirst({
    where: eq(programs.slug, slug),
    with: {
      coach: true,
    },
  });
};
