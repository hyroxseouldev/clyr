import { eq, asc } from "drizzle-orm";
import { programWeeks, workouts, workoutSessions } from "@/db/schema";
import { db } from "@/db";

/**
 * ==========================================
 * WEEK (주차) QUERIES
 * ==========================================
 */

/**
 * 주차 생성
 */
export const createWeekQuery = async (
  data: typeof programWeeks.$inferInsert
) => {
  const [week] = await db.insert(programWeeks).values(data).returning();
  return week;
};

/**
 * 주차 ID로 조회
 */
export const getWeekByIdQuery = async (weekId: string) => {
  return await db.query.programWeeks.findFirst({
    where: eq(programWeeks.id, weekId),
    with: {
      workouts: {
        orderBy: [asc(workouts.dayNumber)],
        with: {
          sessions: {
            orderBy: [asc(workoutSessions.orderIndex)],
          },
        },
      },
    },
  });
};

/**
 * 프로그램의 모든 주차 조회
 */
export const getWeeksByProgramIdQuery = async (programId: string) => {
  return await db.query.programWeeks.findMany({
    where: eq(programWeeks.programId, programId),
    orderBy: [asc(programWeeks.weekNumber)],
    with: {
      workouts: {
        orderBy: [asc(workouts.dayNumber)],
        with: {
          sessions: {
            orderBy: [asc(workoutSessions.orderIndex)],
          },
        },
      },
    },
  });
};

/**
 * 주차 수정
 */
export const updateWeekQuery = async (
  weekId: string,
  data: Partial<typeof programWeeks.$inferInsert>
) => {
  const [updatedWeek] = await db
    .update(programWeeks)
    .set(data)
    .where(eq(programWeeks.id, weekId))
    .returning();
  return updatedWeek;
};

/**
 * 주차 삭제
 */
export const deleteWeekQuery = async (weekId: string) => {
  await db.delete(programWeeks).where(eq(programWeeks.id, weekId));
};

/**
 * ==========================================
 * WORKOUT (일차) QUERIES
 * ==========================================
 */

/**
 * 일차 생성
 */
export const createWorkoutQuery = async (
  data: typeof workouts.$inferInsert
) => {
  const [workout] = await db.insert(workouts).values(data).returning();
  return workout;
};

/**
 * 일차 ID로 조회
 */
export const getWorkoutByIdQuery = async (workoutId: string) => {
  return await db.query.workouts.findFirst({
    where: eq(workouts.id, workoutId),
    with: {
      sessions: {
        orderBy: [asc(workoutSessions.orderIndex)],
      },
    },
  });
};

/**
 * 주차의 모든 일차 조회
 */
export const getWorkoutsByWeekIdQuery = async (weekId: string) => {
  return await db.query.workouts.findMany({
    where: eq(workouts.weekId, weekId),
    orderBy: [asc(workouts.dayNumber)],
    with: {
      sessions: {
        orderBy: [asc(workoutSessions.orderIndex)],
      },
    },
  });
};

/**
 * 프로그램의 모든 일차 조회
 */
export const getWorkoutsByProgramIdQuery = async (programId: string) => {
  return await db.query.workouts.findMany({
    where: eq(workouts.programId, programId),
    orderBy: [asc(workouts.dayNumber)],
    with: {
      sessions: {
        orderBy: [asc(workoutSessions.orderIndex)],
      },
    },
  });
};

/**
 * 일차 수정
 */
export const updateWorkoutQuery = async (
  workoutId: string,
  data: Partial<typeof workouts.$inferInsert>
) => {
  const [updatedWorkout] = await db
    .update(workouts)
    .set(data)
    .where(eq(workouts.id, workoutId))
    .returning();
  return updatedWorkout;
};

/**
 * 일차 삭제
 */
export const deleteWorkoutQuery = async (workoutId: string) => {
  await db.delete(workouts).where(eq(workouts.id, workoutId));
};

/**
 * ==========================================
 * SESSION (운동 상세) QUERIES
 * ==========================================
 */

/**
 * 세션 생성
 */
export const createSessionQuery = async (
  data: typeof workoutSessions.$inferInsert
) => {
  const [session] = await db.insert(workoutSessions).values(data).returning();
  return session;
};

/**
 * 세션 ID로 조회
 */
export const getSessionByIdQuery = async (sessionId: string) => {
  return await db.query.workoutSessions.findFirst({
    where: eq(workoutSessions.id, sessionId),
  });
};

/**
 * 일차의 모든 세션 조회
 */
export const getSessionsByWorkoutIdQuery = async (workoutId: string) => {
  return await db.query.workoutSessions.findMany({
    where: eq(workoutSessions.workoutId, workoutId),
    orderBy: [asc(workoutSessions.orderIndex)],
  });
};

/**
 * 세션 수정
 */
export const updateSessionQuery = async (
  sessionId: string,
  data: Partial<typeof workoutSessions.$inferInsert>
) => {
  const [updatedSession] = await db
    .update(workoutSessions)
    .set(data)
    .where(eq(workoutSessions.id, sessionId))
    .returning();
  return updatedSession;
};

/**
 * 세션 삭제
 */
export const deleteSessionQuery = async (sessionId: string) => {
  await db.delete(workoutSessions).where(eq(workoutSessions.id, sessionId));
};

/**
 * 세션 순서 일괄 변경 (트랜잭션)
 */
export const reorderSessionsQuery = async (
  updates: { id: string; orderIndex: number }[]
) => {
  return await db.transaction(async (tx) => {
    const results = [];
    for (const update of updates) {
      const [updated] = await tx
        .update(workoutSessions)
        .set({ orderIndex: update.orderIndex })
        .where(eq(workoutSessions.id, update.id))
        .returning();
      if (updated) results.push(updated);
    }
    return results;
  });
};

/**
 * ==========================================
 * COMPLEX READ QUERIES
 * ==========================================
 */

/**
 * 프로그램의 전체 커리큘럼 조회 (주차-일차-세션 전체)
 */
export const getFullProgramContentQuery = async (programId: string) => {
  return await db.query.programWeeks.findMany({
    where: eq(programWeeks.programId, programId),
    orderBy: [asc(programWeeks.weekNumber)],
    with: {
      workouts: {
        orderBy: [asc(workouts.dayNumber)],
        with: {
          sessions: {
            orderBy: [asc(workoutSessions.orderIndex)],
          },
        },
      },
    },
  });
};
