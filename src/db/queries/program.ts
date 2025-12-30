import { eq, and, asc, desc } from "drizzle-orm";
import {
  programs,
  programWeeks,
  workouts,
  workoutSessions,
  enrollments,
} from "@/db/schema";
import { db } from "@/db"; // 설정된 db 인스턴스

/**
 * 특정 코치가 등록한 모든 프로그램 목록 조회
 * @param coachId - 코치의 account ID
 */
export const getProgramsByCoachQuery = async (coachId: string) => {
  return await db.query.programs.findMany({
    where: eq(programs.coachId, coachId),
    orderBy: [desc(programs.createdAt)],
    // 필요하다면 수강생 수나 주차 정보 등 추가 관계(with)를 넣을 수 있습니다.
  });
};

export const createProgramWithWeeksQuery = async (
  programData: any,
  weeksData: any[]
) => {
  return await db.transaction(async (tx) => {
    const [newProgram] = await tx
      .insert(programs)
      .values(programData)
      .returning();
    if (weeksData.length > 0) {
      const formattedWeeks = weeksData.map((week) => ({
        ...week,
        programId: newProgram.id,
      }));
      await tx.insert(programWeeks).values(formattedWeeks);
    }
    return newProgram;
  });
};

export const getProgramFullCurriculumQuery = async (programId: string) => {
  return await db.query.programs.findFirst({
    where: eq(programs.id, programId),
    with: {
      weeks: {
        orderBy: [asc(programWeeks.weekNumber)],
        with: {
          workouts: {
            orderBy: [asc(workouts.dayNumber)],
            with: { sessions: { orderBy: [asc(workoutSessions.orderIndex)] } },
          },
        },
      },
    },
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
