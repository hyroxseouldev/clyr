import { eq, desc, and } from "drizzle-orm";
import { sectionRecords, blueprintSections, blueprintSectionItems, programBlueprints } from "@/db/schema";
import { db } from "@/db";

/**
 * ==========================================
 * SECTION RECORD QUERIES (섹션 기록 조회)
 * ==========================================
 */

/**
 * 섹션 기록 생성
 */
export const createSectionRecordQuery = async (
  data: typeof sectionRecords.$inferInsert
) => {
  const [record] = await db.insert(sectionRecords).values(data).returning();
  return record;
};

/**
 * ID로 섹션 기록 조회 (관련 데이터 포함)
 */
export const getSectionRecordByIdQuery = async (recordId: string) => {
  return await db.query.sectionRecords.findFirst({
    where: eq(sectionRecords.id, recordId),
    with: {
      user: true,
      userProfile: true,
      section: true,
      sectionItem: {
        with: {
          blueprint: true,
        },
      },
    },
  });
};

/**
 * 유저의 모든 섹션 기록 조회
 */
export const getSectionRecordsByUserIdQuery = async (userId: string) => {
  return await db.query.sectionRecords.findMany({
    where: eq(sectionRecords.userId, userId),
    orderBy: [desc(sectionRecords.completedAt)],
    with: {
      user: true,
      userProfile: true,
      section: true,
      sectionItem: {
        with: {
          blueprint: true,
        },
      },
    },
  });
};

/**
 * 섹션별 기록 조회 (같은 섹션 비교용 - 1주차 vs 4주차)
 */
export const getSectionRecordsBySectionIdQuery = async (
  sectionId: string
) => {
  return await db.query.sectionRecords.findMany({
    where: eq(sectionRecords.sectionId, sectionId),
    orderBy: [desc(sectionRecords.completedAt)],
    with: {
      user: true,
      userProfile: true,
      section: true,
      sectionItem: {
        with: {
          blueprint: true,
        },
      },
    },
  });
};

/**
 * 프로그램의 특정 Phase-Day 섹션 기록 조회 (코치용)
 */
export const getSectionRecordsByProgramAndDayQuery = async (
  programId: string,
  phaseNumber: number,
  dayNumber: number
) => {
  const results = await db
    .select({
      id: sectionRecords.id,
      userId: sectionRecords.userId,
      sectionId: sectionRecords.sectionId,
      recordType: blueprintSections.recordType,
      isRecordable: blueprintSections.isRecordable,
      content: sectionRecords.content,
      completedAt: sectionRecords.completedAt,
      coachComment: sectionRecords.coachComment,
      createdAt: sectionRecords.createdAt,
      updatedAt: sectionRecords.updatedAt,
    })
    .from(sectionRecords)
    .innerJoin(
      blueprintSectionItems,
      eq(sectionRecords.sectionItemId, blueprintSectionItems.id)
    )
    .innerJoin(
      blueprintSections,
      eq(blueprintSectionItems.sectionId, blueprintSections.id)
    )
    .innerJoin(
      programBlueprints,
      eq(blueprintSectionItems.blueprintId, programBlueprints.id)
    )
    .where(
      and(
        eq(programBlueprints.programId, programId),
        eq(programBlueprints.phaseNumber, phaseNumber),
        eq(programBlueprints.dayNumber, dayNumber)
      )
    )
    .orderBy(desc(sectionRecords.completedAt));

  // 관련 데이터 가져오기
  return await Promise.all(
    results.map(async (row) => {
      const fullRecord = await db.query.sectionRecords.findFirst({
        where: eq(sectionRecords.id, row.id),
        with: {
          user: true,
          userProfile: true,
          section: true,
          sectionItem: {
            with: {
              blueprint: true,
            },
          },
        },
      });
      return fullRecord;
    })
  );
};

/**
 * 섹션 기록 수정
 */
export const updateSectionRecordQuery = async (
  recordId: string,
  data: Partial<typeof sectionRecords.$inferInsert>
) => {
  const [updatedRecord] = await db
    .update(sectionRecords)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(sectionRecords.id, recordId))
    .returning();
  return updatedRecord;
};

/**
 * 섹션 기록 삭제
 */
export const deleteSectionRecordQuery = async (recordId: string) => {
  await db.delete(sectionRecords).where(eq(sectionRecords.id, recordId));
};
