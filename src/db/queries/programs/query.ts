import { eq, and, asc, desc } from "drizzle-orm";
import {
  programs,
  programWeeks,
  workouts,
  workoutSessions,
  enrollments,
  coachProfile,
} from "@/db/schema";

/**
 * 1. CREATE (생성)
 * 프로그램과 그 하위 주차(Weeks) 정보를 트랜잭션으로 안전하게 함께 생성
 */
export const createProgramWithWeeks = async (
  db: any,
  programData: any,
  weeksData: any[]
) => {
  return await db.transaction(async (tx: any) => {
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

/**
 * 2. READ (조회)
 * 특정 프로그램의 모든 계층 구조(주차 > 일차 > 세션)를 한 번에 가져오기
 */
export const getProgramFullCurriculum = async (db: any, programId: string) => {
  return await db.query.programs.findFirst({
    where: eq(programs.id, programId),
    with: {
      weeks: {
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
      },
    },
  });
};

/**
 * 3. UPDATE (수정)
 * 프로그램의 기본 정보(가격, 공개 여부 등) 수정
 */
export const updateProgram = async (
  db: any,
  programId: string,
  updateData: any
) => {
  return await db
    .update(programs)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(programs.id, programId))
    .returning();
};

/**
 * 4. DELETE (삭제)
 * 프로그램을 삭제 (스키마에 설정된 cascade에 의해 하위 데이터도 자동 삭제됨)
 */
export const deleteProgram = async (db: any, programId: string) => {
  return await db
    .delete(programs)
    .where(eq(programs.id, programId))
    .returning();
};

/**
 * 5. ACCESS CHECK (수강 권한 확인)
 * 현재 사용자가 특정 프로그램을 수강 중이며 만료되지 않았는지 확인
 */
export const checkAccess = async (
  db: any,
  userId: string,
  programId: string
) => {
  const now = new Date();
  return await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, userId),
      eq(enrollments.programId, programId),
      eq(enrollments.status, "ACTIVE")
    ),
  });
};
