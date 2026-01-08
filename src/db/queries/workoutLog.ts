import { eq, desc, and } from "drizzle-orm";
import { workoutLogs } from "@/db/schema";
import { db } from "@/db";

/**
 * ==========================================
 * WORKOUT LOG (운동 일지) QUERIES
 * ==========================================
 */

/**
 * 운동 일지 생성
 */
export const createWorkoutLogQuery = async (
  data: typeof workoutLogs.$inferInsert
) => {
  const [log] = await db.insert(workoutLogs).values(data).returning();
  return log;
};

/**
 * ID로 운동 일지 조회
 */
export const getWorkoutLogByIdQuery = async (logId: string) => {
  return await db.query.workoutLogs.findFirst({
    where: eq(workoutLogs.id, logId),
    with: {
      user: true,
      library: true,
      blueprint: true,
    },
  });
};

/**
 * 사용자의 모든 운동 일지 조회
 */
export const getWorkoutLogsByUserIdQuery = async (userId: string) => {
  return await db.query.workoutLogs.findMany({
    where: eq(workoutLogs.userId, userId),
    orderBy: [desc(workoutLogs.logDate)],
    with: {
      user: true,
      library: true,
      blueprint: true,
    },
  });
};

/**
 * 사용자의 특정 프로그램 운동 일지 조회
 * (blueprint를 통해 program 필터링)
 */
export const getWorkoutLogsByUserIdAndProgramIdQuery = async (
  userId: string,
  programId: string
) => {
  return await db.query.workoutLogs.findMany({
    where: eq(workoutLogs.userId, userId),
    orderBy: [desc(workoutLogs.logDate)],
    with: {
      user: true,
      library: true,
      blueprint: {
        with: {
          program: true,
        },
      },
    },
  }).then(logs => logs.filter(log => log.blueprint?.programId === programId));
};

/**
 * 운동 일지 수정
 */
export const updateWorkoutLogQuery = async (
  logId: string,
  data: Partial<typeof workoutLogs.$inferInsert>
) => {
  const [updatedLog] = await db
    .update(workoutLogs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(workoutLogs.id, logId))
    .returning();
  return updatedLog;
};

/**
 * 운동 일지 삭제
 */
export const deleteWorkoutLogQuery = async (logId: string) => {
  await db.delete(workoutLogs).where(eq(workoutLogs.id, logId));
};
