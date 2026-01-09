import { eq, desc, and, sql } from "drizzle-orm";
import { workoutLogs, programBlueprints } from "@/db/schema";
import { db } from "@/db";
import type { HomeworkSubmission, HomeworkStats } from "./workoutLog.types";

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

/**
 * ==========================================
 * HOMEWORK MANAGEMENT (숙제 관리) QUERIES
 * ==========================================
 */

/**
 * 프로그램의 특정 Phase-Day별 숙제 제출 목록 조회
 * 코치가 회원들의 숙제를 검토하기 위해 사용
 */
export const getHomeworkSubmissionsByProgramAndDayQuery = async (
  programId: string,
  phaseNumber: number,
  dayNumber: number
): Promise<HomeworkSubmission[]> => {
  const results = await db
    .select({
      // WorkoutLog fields
      id: workoutLogs.id,
      userId: workoutLogs.userId,
      logDate: workoutLogs.logDate,
      createdAt: workoutLogs.createdAt,
      content: workoutLogs.content,
      intensity: workoutLogs.intensity,
      maxWeight: workoutLogs.maxWeight,
      totalVolume: workoutLogs.totalVolume,
      totalDuration: workoutLogs.totalDuration,
      coachComment: workoutLogs.coachComment,
      isCheckedByCoach: workoutLogs.isCheckedByCoach,
    })
    .from(workoutLogs)
    .innerJoin(programBlueprints, eq(workoutLogs.blueprintId, programBlueprints.id))
    .where(
      and(
        eq(programBlueprints.programId, programId),
        eq(programBlueprints.phaseNumber, phaseNumber),
        eq(programBlueprints.dayNumber, dayNumber)
      )
    )
    .orderBy(desc(workoutLogs.createdAt));

  // Fetch related data separately (user, library, blueprint, routineBlock)
  const submissions = await Promise.all(
    results.map(async (row) => {
      const fullLog = await db.query.workoutLogs.findFirst({
        where: eq(workoutLogs.id, row.id),
        with: {
          user: true,
          library: true,
          blueprint: {
            with: {
              routineBlock: true,
            },
          },
        },
      });

      if (!fullLog?.user || !fullLog?.library) {
        throw new Error("Missing required relations");
      }

      return {
        ...row,
        user: {
          id: fullLog.user.id,
          email: fullLog.user.email,
          fullName: fullLog.user.fullName,
          role: fullLog.user.role,
          avatarUrl: fullLog.user.avatarUrl,
          createdAt: fullLog.user.createdAt,
        },
        library: fullLog.library,
        blueprint: fullLog.blueprint
          ? {
              ...fullLog.blueprint,
              routineBlock: fullLog.blueprint.routineBlock ?? null,
            }
          : null,
      } as HomeworkSubmission;
    })
  );

  return submissions;
};

/**
 * 리더보드 정렬이 적용된 숙제 제출 목록 조회
 * workout_format에 따라 자동 정렬 (FOR_TIME: 오름차순, AMRAP: 내림차순 등)
 */
export const getHomeworkLeaderboardByProgramAndDayQuery = async (
  programId: string,
  phaseNumber: number,
  dayNumber: number
): Promise<HomeworkSubmission[]> => {
  const submissions = await getHomeworkSubmissionsByProgramAndDayQuery(
    programId,
    phaseNumber,
    dayNumber
  );

  // 루틴 블록의 workout_format에 따라 정렬
  const workoutFormat = submissions[0]?.blueprint?.routineBlock?.workoutFormat;

  if (!workoutFormat) {
    return submissions;
  }

  // 정렬 로직
  const sorted = [...submissions].sort((a, b) => {
    switch (workoutFormat) {
      case "FOR_TIME":
        // 시간 기반: 짧을수록 좋음 (오름차순)
        return (a.totalDuration ?? Infinity) - (b.totalDuration ?? Infinity);
      case "AMRAP":
      case "REPS":
        // 횟수 기반: 많을수록 좋음 (내림차순)
        return parseFloat(b.totalVolume) - parseFloat(a.totalVolume);
      case "WEIGHT":
        // 무게 기반: 무거울수록 좋음 (내림차순)
        return parseFloat(b.maxWeight) - parseFloat(a.maxWeight);
      default:
        // 기본: 제출 시간순
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  return sorted;
};

/**
 * 숙제 통계 조회 (미확인, 완료 등)
 */
export const getHomeworkStatsByProgramQuery = async (
  programId: string
): Promise<HomeworkStats> => {
  const programLogs = await db
    .select({
      isCheckedByCoach: workoutLogs.isCheckedByCoach,
    })
    .from(workoutLogs)
    .innerJoin(programBlueprints, eq(workoutLogs.blueprintId, programBlueprints.id))
    .where(eq(programBlueprints.programId, programId));

  const totalSubmissions = programLogs.length;
  const completedReviews = programLogs.filter((log) => log.isCheckedByCoach).length;
  const pendingReviews = totalSubmissions - completedReviews;

  return {
    totalSubmissions,
    pendingReviews,
    completedReviews,
  };
};
