import { eq, desc, and, asc, isNull } from "drizzle-orm";
import { sectionRecords, blueprintSections, blueprintSectionItems, programBlueprints, programs, account, userProfile } from "@/db/schema";
import type { BlueprintSection } from "@/db/schema";
import { db } from "@/db";
import type { HomeworkPageData, HomeworkStats, ProgramPhaseDay, GroupedHomeworkPageData, SectionRecordWithBlueprint } from "./section-records.types";

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
  const records = await Promise.all(
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

  // Add recordType and isRecordable to each record
  return records.map((record, index) => {
    if (!record) return null;
    return {
      ...record,
      recordType: results[index].recordType,
      isRecordable: results[index].isRecordable,
    };
  }).filter((r): r is NonNullable<typeof r> => r != null);
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

/**
 * ==========================================
 * HOMEWORK PAGE QUERIES
 * ==========================================
 */

/**
 * Get all available phase/day combinations for a program
 * Returns only days that have at least one recordable section
 */
export async function getProgramAvailableDaysQuery(
  programId: string
): Promise<ProgramPhaseDay[]> {
  const results = await db
    .select({
      phaseNumber: programBlueprints.phaseNumber,
      dayNumber: programBlueprints.dayNumber,
    })
    .from(programBlueprints)
    .innerJoin(
      blueprintSectionItems,
      eq(blueprintSectionItems.blueprintId, programBlueprints.id)
    )
    .innerJoin(
      blueprintSections,
      eq(blueprintSections.id, blueprintSectionItems.sectionId)
    )
    .where(eq(programBlueprints.programId, programId))
    .orderBy(
      asc(programBlueprints.phaseNumber),
      asc(programBlueprints.dayNumber)
    );

  // Remove duplicates (same phase/day may have multiple recordable sections)
  const uniqueDays = Array.from(
    new Map(
      results.map((r) => [`${r.phaseNumber}-${r.dayNumber}`, r])
    ).values()
  );

  return uniqueDays;
}

/**
 * Get statistics for homework page
 */
export async function getHomeworkStatsQuery(
  programId: string
): Promise<HomeworkStats> {
  // Count all submissions for this program
  const allRecords = await db
    .select({ count: sectionRecords.id })
    .from(sectionRecords)
    .innerJoin(
      blueprintSectionItems,
      eq(sectionRecords.sectionItemId, blueprintSectionItems.id)
    )
    .innerJoin(
      programBlueprints,
      eq(blueprintSectionItems.blueprintId, programBlueprints.id)
    )
    .where(eq(programBlueprints.programId, programId));

  const totalSubmissions = allRecords.length;

  // Count pending reviews (no coach comment)
  const pendingRecords = await db
    .select({ count: sectionRecords.id })
    .from(sectionRecords)
    .innerJoin(
      blueprintSectionItems,
      eq(sectionRecords.sectionItemId, blueprintSectionItems.id)
    )
    .innerJoin(
      programBlueprints,
      eq(blueprintSectionItems.blueprintId, programBlueprints.id)
    )
    .where(
      and(
        eq(programBlueprints.programId, programId),
        isNull(sectionRecords.coachComment)
      )
    );

  const pendingReviews = pendingRecords.length;

  return {
    totalSubmissions,
    pendingReviews,
    completedReviews: totalSubmissions - pendingReviews,
  };
}

/**
 * Get initial page data for homework
 */
export async function getHomeworkPageDataQuery(
  programId: string
): Promise<HomeworkPageData | null> {
  const program = await db.query.programs.findFirst({
    where: eq(programs.id, programId),
    columns: { id: true, title: true },
  });

  if (!program) return null;

  const [availableDays, stats] = await Promise.all([
    getProgramAvailableDaysQuery(programId),
    getHomeworkStatsQuery(programId),
  ]);

  return {
    program: { id: program.id, title: program.title },
    availableDays,
    stats,
  };
}

/**
 * ==========================================
 * GROUPED HOMEWORK PAGE QUERIES
 * ==========================================
 */

/**
 * Get ALL section records for a program, grouped by blueprint → section
 * Returns records from all sections (with blueprint info)
 */
export async function getGroupedSectionRecordsForProgramQuery(
  programId: string
): Promise<GroupedHomeworkPageData | null> {
  const program = await db.query.programs.findFirst({
    where: eq(programs.id, programId),
    columns: { id: true, title: true },
  });

  if (!program) return null;

  // Get all section records for this program's blueprints with blueprint info
  const results = await db
    .select({
      recordId: sectionRecords.id,
      userId: sectionRecords.userId,
      sectionId: sectionRecords.sectionId,
      content: sectionRecords.content,
      completedAt: sectionRecords.completedAt,
      coachComment: sectionRecords.coachComment,
      createdAt: sectionRecords.createdAt,
      updatedAt: sectionRecords.updatedAt,
      // Blueprint info
      blueprintId: programBlueprints.id,
      blueprintPhaseNumber: programBlueprints.phaseNumber,
      blueprintDayNumber: programBlueprints.dayNumber,
      // Section info
      sectionTitle: blueprintSections.title,
      recordType: blueprintSections.recordType,
      isRecordable: blueprintSections.isRecordable,
    })
    .from(sectionRecords)
    .innerJoin(
      blueprintSectionItems,
      eq(sectionRecords.sectionItemId, blueprintSectionItems.id)
    )
    .innerJoin(
      programBlueprints,
      eq(blueprintSectionItems.blueprintId, programBlueprints.id)
    )
    .innerJoin(
      blueprintSections,
      eq(blueprintSections.id, blueprintSectionItems.sectionId)
    )
    .where(eq(programBlueprints.programId, programId))
    .orderBy(
      asc(programBlueprints.phaseNumber),
      asc(programBlueprints.dayNumber),
      asc(blueprintSections.title),
      desc(sectionRecords.completedAt)
    );

  // Fetch full user data for each record
  const recordsWithUsers = await Promise.all(
    results.map(async (row) => {
      const userData = await db.query.account.findFirst({
        where: eq(account.id, row.userId),
        columns: { id: true, email: true, fullName: true, role: true, avatarUrl: true },
      });
      const profileData = await db.query.userProfile.findFirst({
        where: eq(userProfile.accountId, row.userId),
        columns: { id: true, nickname: true },
      });
      return {
        ...row,
        user: userData,
        userProfile: profileData ? { id: profileData.id, nickname: profileData.nickname } : null,
      };
    })
  );

  // Group by blueprint → section
  const blueprintMap = new Map<string, import("./section-records.types").BlueprintGroup>();

  for (const record of recordsWithUsers) {
    const blueprintKey = `${record.blueprintPhaseNumber}-${record.blueprintDayNumber}`;

    if (!blueprintMap.has(blueprintKey)) {
      blueprintMap.set(blueprintKey, {
        blueprint: {
          id: record.blueprintId,
          phaseNumber: record.blueprintPhaseNumber,
          dayNumber: record.blueprintDayNumber,
        },
        sections: [],
      });
    }

    const blueprintGroup = blueprintMap.get(blueprintKey)!;
    let sectionGroup = blueprintGroup.sections.find(
      (s) => s.section.id === record.sectionId
    );

    if (!sectionGroup) {
      sectionGroup = {
        section: {
          id: record.sectionId,
          title: record.sectionTitle,
        },
        records: [],
      };
      blueprintGroup.sections.push(sectionGroup);
    }

    const sectionRecord: SectionRecordWithBlueprint = {
      id: record.recordId,
      userId: record.userId,
      sectionId: record.sectionId,
      content: record.content,
      completedAt: record.completedAt,
      coachComment: record.coachComment,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      recordType: record.recordType,
      isRecordable: record.isRecordable,
      user: record.user!,
      userProfile: record.userProfile,
      section: {
        id: record.sectionId,
        title: record.sectionTitle,
      } as BlueprintSection,
      sectionItem: {
        id: record.blueprintId,
        orderIndex: 0,
        blueprint: {
          id: record.blueprintId,
          phaseNumber: record.blueprintPhaseNumber,
          dayNumber: record.blueprintDayNumber,
          programId: programId,
          createdAt: new Date(),
          updatedAt: new Date(),
          dayTitle: null,
          notes: null,
        },
      },
      blueprint: {
        id: record.blueprintId,
        phaseNumber: record.blueprintPhaseNumber,
        dayNumber: record.blueprintDayNumber,
      },
    };

    sectionGroup.records.push(sectionRecord);
  }

  // Calculate stats
  const allRecords = recordsWithUsers;
  const totalSubmissions = allRecords.length;
  const pendingReviews = allRecords.filter((r) => !r.coachComment).length;

  return {
    program: { id: program.id, title: program.title },
    blueprintGroups: Array.from(blueprintMap.values()),
    stats: {
      totalSubmissions,
      pendingReviews,
      completedReviews: totalSubmissions - pendingReviews,
    },
  };
}
