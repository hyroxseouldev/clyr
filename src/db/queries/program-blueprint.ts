import { db } from "@/db";
import { programBlueprints, programs, blueprintSections, blueprintSectionItems } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";

/**
 * ==========================================
 * PROGRAM BLUEPRINT QUERIES
 * ==========================================
 */

export interface ProgramBlueprintWithSections {
  id: string;
  programId: string;
  phaseNumber: number;
  dayNumber: number;
  dayTitle: string | null;
  // Sections support
  sections: Array<{
    id: string;
    title: string;
    content: string;
    orderIndex: number;
  }>;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramBlueprintGroupedByPhase {
  phaseNumber: number;
  days: ProgramBlueprintWithSections[];
}

export interface ProgramPlanData {
  programId: string;
  programTitle: string;
  durationWeeks: number;
  blueprints: ProgramBlueprintGroupedByPhase[];
}

/**
 * 프로그램의 모든 블루프린트 조회
 */
export async function getProgramBlueprintsQuery(
  programId: string
): Promise<ProgramBlueprintWithSections[]> {
  const blueprints = await db
    .select({
      id: programBlueprints.id,
      programId: programBlueprints.programId,
      phaseNumber: programBlueprints.phaseNumber,
      dayNumber: programBlueprints.dayNumber,
      dayTitle: programBlueprints.dayTitle,
      notes: programBlueprints.notes,
      createdAt: programBlueprints.createdAt,
      updatedAt: programBlueprints.updatedAt,
    })
    .from(programBlueprints)
    .where(eq(programBlueprints.programId, programId))
    .orderBy(asc(programBlueprints.phaseNumber), asc(programBlueprints.dayNumber));

  // Fetch sections from join table for each blueprint
  const blueprintsWithSections = await Promise.all(
    blueprints.map(async (blueprint) => {
      // Fetch sections from join table for each blueprint
      const sections = await db
        .select({
          id: blueprintSections.id,
          title: blueprintSections.title,
          content: blueprintSections.content,
          orderIndex: blueprintSectionItems.orderIndex,
        })
        .from(blueprintSectionItems)
        .innerJoin(blueprintSections, eq(blueprintSectionItems.sectionId, blueprintSections.id))
        .where(eq(blueprintSectionItems.blueprintId, blueprint.id))
        .orderBy(asc(blueprintSectionItems.orderIndex));

      return {
        ...blueprint,
        sections: sections,
      };
    })
  );

  return blueprintsWithSections as ProgramBlueprintWithSections[];
}

/**
 * 프로그램의 모든 블루프린트를 페이즈별로 그룹화하여 조회
 */
export async function getProgramPlanDataQuery(
  programId: string
): Promise<ProgramPlanData | null> {
  // 프로그램 정보 조회
  const program = await db.query.programs.findFirst({
    where: eq(programs.id, programId),
  });

  if (!program) {
    return null;
  }

  // 블루프린트 조회
  const blueprints = await getProgramBlueprintsQuery(programId);

  // 페이즈별로 그룹화
  const phaseMap = new Map<number, ProgramBlueprintWithSections[]>();

  blueprints.forEach((blueprint) => {
    const phase = blueprint.phaseNumber;
    if (!phaseMap.has(phase)) {
      phaseMap.set(phase, []);
    }
    phaseMap.get(phase)!.push(blueprint);
  });

  // 정렬된 배열로 변환
  const groupedBlueprints: ProgramBlueprintGroupedByPhase[] = Array.from(
    phaseMap.entries()
  )
    .map(([phaseNumber, days]) => ({
      phaseNumber,
      days,
    }))
    .sort((a, b) => a.phaseNumber - b.phaseNumber);

  return {
    programId: program.id,
    programTitle: program.title,
    durationWeeks: program.durationWeeks,
    blueprints: groupedBlueprints,
  };
}

/**
 * 특정 페이즈와 일차의 블루프린트 조회
 */
export async function getProgramBlueprintByPhaseAndDayQuery(
  programId: string,
  phaseNumber: number,
  dayNumber: number
): Promise<ProgramBlueprintWithSections | null> {
  const [blueprint] = await db
    .select({
      id: programBlueprints.id,
      programId: programBlueprints.programId,
      phaseNumber: programBlueprints.phaseNumber,
      dayNumber: programBlueprints.dayNumber,
      dayTitle: programBlueprints.dayTitle,
      notes: programBlueprints.notes,
      createdAt: programBlueprints.createdAt,
      updatedAt: programBlueprints.updatedAt,
    })
    .from(programBlueprints)
    .where(
      and(
        eq(programBlueprints.programId, programId),
        eq(programBlueprints.phaseNumber, phaseNumber),
        eq(programBlueprints.dayNumber, dayNumber)
      )
    );

  if (!blueprint) {
    return null;
  }

  // Fetch sections from join table
  const sections = await db
    .select({
      id: blueprintSections.id,
      title: blueprintSections.title,
      content: blueprintSections.content,
      orderIndex: blueprintSectionItems.orderIndex,
    })
    .from(blueprintSectionItems)
    .innerJoin(blueprintSections, eq(blueprintSectionItems.sectionId, blueprintSections.id))
    .where(eq(blueprintSectionItems.blueprintId, blueprint.id))
    .orderBy(asc(blueprintSectionItems.orderIndex));

  return {
    ...blueprint,
    sections: sections,
  } as ProgramBlueprintWithSections;
}

/**
 * 프로그램 블루프린트 생성
 */
export async function createProgramBlueprintQuery(data: {
  programId: string;
  phaseNumber: number;
  dayNumber: number;
  dayTitle?: string | null;
  notes?: string | null;
}) {
  const [blueprint] = await db.insert(programBlueprints).values(data).returning();
  return blueprint;
}

/**
 * 프로그램 블루프린트 수정
 */
export async function updateProgramBlueprintQuery(
  id: string,
  data: {
    dayTitle?: string | null;
    notes?: string | null;
  }
) {
  const [updated] = await db
    .update(programBlueprints)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(programBlueprints.id, id))
    .returning();
  return updated;
}

/**
 * 프로그램 블루프린트 삭제
 */
export async function deleteProgramBlueprintQuery(id: string) {
  await db.delete(programBlueprints).where(eq(programBlueprints.id, id));
}

/**
 * 페이즈별 블루프린트 일괄 생성
 * @param programId 프로그램 ID
 * @param phaseNumber 페이즈 번호
 * @param dayCount 생성할 일차 수
 */
export async function createPhaseBlueprintsQuery(
  programId: string,
  phaseNumber: number,
  dayCount: number
) {
  const blueprints = [];

  for (let day = 1; day <= dayCount; day++) {
    const [blueprint] = await db
      .insert(programBlueprints)
      .values({
        programId,
        phaseNumber,
        dayNumber: day,
      })
      .returning();
    blueprints.push(blueprint);
  }

  return blueprints;
}

/**
 * 페이즈의 모든 블루프린트 삭제
 */
export async function deletePhaseBlueprintsQuery(
  programId: string,
  phaseNumber: number
) {
  await db
    .delete(programBlueprints)
    .where(
      and(
        eq(programBlueprints.programId, programId),
        eq(programBlueprints.phaseNumber, phaseNumber)
      )
    );
}

/**
 * 프로그램의 총 일수 계산
 */
export async function getProgramTotalDaysQuery(programId: string): Promise<number> {
  const result = await db
    .select({ count: programBlueprints.dayNumber })
    .from(programBlueprints)
    .where(eq(programBlueprints.programId, programId))
    .orderBy(desc(programBlueprints.dayNumber))
    .limit(1);

  return result[0]?.count || 0;
}
