import { eq, and, asc } from "drizzle-orm";
import {
  programs,
  programWeeks,
  workouts,
  workoutSessions,
  enrollments,
} from "@/db/schema";
import { db } from "@/db"; // 설정된 db 인스턴스

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
