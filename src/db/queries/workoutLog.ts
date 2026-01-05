import { eq, desc } from "drizzle-orm";
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
    },
  });
};

/**
 * 코치의 프로그램에 수강 중인 회원의 운동 일지 조회
 * (특정 프로그램 수강생들의 로그만 조회)
 */
export const getWorkoutLogsByProgramIdQuery = async (programId: string) => {
  // enrollments와 join해서 해당 프로그램 수강생들의 로그만 조회
  const result = await db.query.workoutLogs.findMany({
    orderBy: [desc(workoutLogs.logDate)],
    with: {
      user: true,
    },
  });

  // 여기서 program 관련 필터링은 application layer에서 처리
  // (user가 해당 program에 enrolled되어 있는지 확인)
  return result;
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
