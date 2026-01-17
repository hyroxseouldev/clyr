import { db } from "@/db";
import { programBlueprints, routineBlocks, programs, blueprintRoutineBlocks, blueprintSections, blueprintSectionItems } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";

/**
 * ==========================================
 * PROGRAM BLUEPRINT QUERIES
 * ==========================================
 */

export interface ProgramBlueprintWithBlock {
  id: string;
  programId: string;
  phaseNumber: number;
  dayNumber: number;
  dayTitle: string | null;
  // Legacy single block support (deprecated, kept for backward compatibility)
  routineBlockId: string | null;
  routineBlockName: string | null;
  routineBlockFormat: string | null;
  // New multiple blocks support
  routineBlocks: Array<{
    id: string;
    name: string;
    workoutFormat: string;
    orderIndex: number;
  }>;
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
  days: ProgramBlueprintWithBlock[];
}

export interface ProgramPlanData {
  programId: string;
  programTitle: string;
  durationWeeks: number;
  blueprints: ProgramBlueprintGroupedByPhase[];
}

/**
 * 프로그램의 모든 블루프린트 조회 (루틴 블록 정보 포함)
 */
export async function getProgramBlueprintsQuery(
  programId: string
): Promise<ProgramBlueprintWithBlock[]> {
  const blueprints = await db
    .select({
      id: programBlueprints.id,
      programId: programBlueprints.programId,
      phaseNumber: programBlueprints.phaseNumber,
      dayNumber: programBlueprints.dayNumber,
      dayTitle: programBlueprints.dayTitle,
      routineBlockId: programBlueprints.routineBlockId, // Legacy support
      routineBlockName: routineBlocks.name, // Legacy support
      routineBlockFormat: routineBlocks.workoutFormat, // Legacy support
      notes: programBlueprints.notes,
      createdAt: programBlueprints.createdAt,
      updatedAt: programBlueprints.updatedAt,
    })
    .from(programBlueprints)
    .leftJoin(routineBlocks, eq(programBlueprints.routineBlockId, routineBlocks.id))
    .where(eq(programBlueprints.programId, programId))
    .orderBy(asc(programBlueprints.phaseNumber), asc(programBlueprints.dayNumber));

  // Fetch routine blocks from join table for each blueprint
  const blueprintsWithBlocks = await Promise.all(
    blueprints.map(async (blueprint) => {
      const blocks = await db
        .select({
          id: routineBlocks.id,
          name: routineBlocks.name,
          workoutFormat: routineBlocks.workoutFormat,
          orderIndex: blueprintRoutineBlocks.orderIndex,
        })
        .from(blueprintRoutineBlocks)
        .innerJoin(routineBlocks, eq(blueprintRoutineBlocks.routineBlockId, routineBlocks.id))
        .where(eq(blueprintRoutineBlocks.blueprintId, blueprint.id))
        .orderBy(asc(blueprintRoutineBlocks.orderIndex));

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
        routineBlocks: blocks,
        sections: sections,
      };
    })
  );

  return blueprintsWithBlocks as ProgramBlueprintWithBlock[];
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
  const phaseMap = new Map<number, ProgramBlueprintWithBlock[]>();

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
): Promise<ProgramBlueprintWithBlock | null> {
  const [blueprint] = await db
    .select({
      id: programBlueprints.id,
      programId: programBlueprints.programId,
      phaseNumber: programBlueprints.phaseNumber,
      dayNumber: programBlueprints.dayNumber,
      dayTitle: programBlueprints.dayTitle,
      routineBlockId: programBlueprints.routineBlockId, // Legacy support
      routineBlockName: routineBlocks.name, // Legacy support
      routineBlockFormat: routineBlocks.workoutFormat, // Legacy support
      notes: programBlueprints.notes,
      createdAt: programBlueprints.createdAt,
      updatedAt: programBlueprints.updatedAt,
    })
    .from(programBlueprints)
    .leftJoin(routineBlocks, eq(programBlueprints.routineBlockId, routineBlocks.id))
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

  // Fetch routine blocks from join table
  const blocks = await db
    .select({
      id: routineBlocks.id,
      name: routineBlocks.name,
      workoutFormat: routineBlocks.workoutFormat,
      orderIndex: blueprintRoutineBlocks.orderIndex,
    })
    .from(blueprintRoutineBlocks)
    .innerJoin(routineBlocks, eq(blueprintRoutineBlocks.routineBlockId, routineBlocks.id))
    .where(eq(blueprintRoutineBlocks.blueprintId, blueprint.id))
    .orderBy(asc(blueprintRoutineBlocks.orderIndex));

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
    routineBlocks: blocks,
    sections: sections,
  } as ProgramBlueprintWithBlock;
}

/**
 * 프로그램 블루프린트 생성
 */
export async function createProgramBlueprintQuery(data: {
  programId: string;
  phaseNumber: number;
  dayNumber: number;
  dayTitle?: string | null;
  routineBlockId?: string | null;
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
    routineBlockId?: string | null;
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

/**
 * ==========================================
 * BLUEPRINT ROUTINE BLOCKS (JOIN TABLE) QUERIES
 * ==========================================
 */

/**
 * Add routine block to blueprint
 */
export async function addRoutineBlockToBlueprintQuery(data: {
  blueprintId: string;
  routineBlockId: string;
  orderIndex: number;
}) {
  const [join] = await db.insert(blueprintRoutineBlocks).values(data).returning();
  return join;
}

/**
 * Remove routine block from blueprint
 */
export async function removeRoutineBlockFromBlueprintQuery(
  blueprintId: string,
  routineBlockId: string
) {
  await db
    .delete(blueprintRoutineBlocks)
    .where(
      and(
        eq(blueprintRoutineBlocks.blueprintId, blueprintId),
        eq(blueprintRoutineBlocks.routineBlockId, routineBlockId)
      )
    );
}

/**
 * Remove all routine blocks from blueprint
 */
export async function removeRoutineBlocksFromBlueprintQuery(blueprintId: string) {
  await db
    .delete(blueprintRoutineBlocks)
    .where(eq(blueprintRoutineBlocks.blueprintId, blueprintId));
}

/**
 * Update routine block order for blueprint
 */
export async function updateRoutineBlockOrderQuery(
  blueprintId: string,
  updates: Array<{ routineBlockId: string; orderIndex: number }>
) {
  await db.transaction(async (tx) => {
    for (const update of updates) {
      await tx
        .update(blueprintRoutineBlocks)
        .set({ orderIndex: update.orderIndex })
        .where(
          and(
            eq(blueprintRoutineBlocks.blueprintId, blueprintId),
            eq(blueprintRoutineBlocks.routineBlockId, update.routineBlockId)
          )
        );
    }
  });
}
