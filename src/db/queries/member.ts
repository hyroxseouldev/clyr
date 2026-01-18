import { eq, and, desc, sql, gte, lte, count, max } from "drizzle-orm";
import { enrollments, orders, workoutLogs, programBlueprints, programs, account, userProfile } from "@/db/schema";
import { db } from "@/db";

/**
 * ==========================================
 * MEMBER (회원 관리) QUERIES
 * ==========================================
 */

/**
 * 프로그램의 회원 목록 조회 (수강 정보 포함)
 */
export const getMembersByProgramIdQuery = async (programId: string) => {
  const enrollmentList = await db.query.enrollments.findMany({
    where: eq(enrollments.programId, programId),
    with: {
      user: {
        columns: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
      },
      program: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: [desc(enrollments.createdAt)],
  });

  // 각 회원의 운동 기록 통계 계산
  const membersWithStats = await Promise.all(
    enrollmentList.map(async (enrollment) => {
      const workoutStats = await db
        .select({
          count: count(),
          lastWorkoutDate: max(workoutLogs.logDate),
        })
        .from(workoutLogs)
        .innerJoin(programBlueprints, eq(workoutLogs.blueprintId, programBlueprints.id))
        .where(
          and(
            eq(workoutLogs.userId, enrollment.userId),
            eq(programBlueprints.programId, programId)
          )
        );

      return {
        ...enrollment,
        workoutCount: workoutStats[0]?.count || 0,
        lastWorkoutDate: workoutStats[0]?.lastWorkoutDate || null,
      };
    })
  );

  return membersWithStats;
};

/**
 * 회원 상세 정보 조회 (특정 프로그램)
 */
export const getMemberDetailQuery = async (memberId: string, programId: string) => {
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, memberId),
      eq(enrollments.programId, programId)
    ),
    with: {
      user: {
        columns: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
      },
      program: true,
      order: {
        columns: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!enrollment) {
    return null;
  }

  // 회원의 프로필 정보 조회
  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.accountId, memberId),
  });

  return {
    ...enrollment,
    userProfile: profile || null,
  };
};

/**
 * 회원의 운동 기록 목록 조회 (특정 프로그램)
 */
export const getMemberWorkoutLogsByProgramQuery = async (
  memberId: string,
  programId: string
) => {
  return await db.query.workoutLogs.findMany({
    where: eq(workoutLogs.userId, memberId),
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
 * 회원의 코치 코멘트 목록 조회 (특정 프로그램)
 * workout_logs의 coachComment 필드 사용
 */
export const getMemberCoachCommentsQuery = async (
  memberId: string,
  programId: string
) => {
  const comments = await db
    .select({
      id: workoutLogs.id,
      logDate: workoutLogs.logDate,
      coachComment: workoutLogs.coachComment,
      isCheckedByCoach: workoutLogs.isCheckedByCoach,
      createdAt: workoutLogs.createdAt,
    })
    .from(workoutLogs)
    .innerJoin(programBlueprints, eq(workoutLogs.blueprintId, programBlueprints.id))
    .where(
      and(
        eq(workoutLogs.userId, memberId),
        eq(programBlueprints.programId, programId),
        sql`${workoutLogs.coachComment} IS NOT NULL`
      )
    )
    .orderBy(desc(workoutLogs.logDate));

  return comments.filter(c => c.coachComment !== null);
};

/**
 * 회원의 구매 이력 조회
 */
export const getMemberOrdersQuery = async (memberId: string, coachId?: string) => {
  const conditions = [eq(orders.buyerId, memberId)];

  if (coachId) {
    conditions.push(eq(orders.coachId, coachId));
  }

  return await db.query.orders.findMany({
    where: and(...conditions),
    orderBy: [desc(orders.createdAt)],
    with: {
      buyer: {
        columns: {
          id: true,
          email: true,
          fullName: true,
        },
      },
      program: {
        columns: {
          id: true,
          title: true,
          type: true,
        },
      },
    },
  });
};

/**
 * ==========================================
 * PERFORMANCE & PR (퍼포먼스 & 기록) QUERIES
 * ==========================================
 */

/**
 * 회원의 PR 기록 추출 (특정 종목)
 */
export const getMemberPRHistoryQuery = async (
  memberId: string,
  programId: string,
  libraryId?: string
) => {
  const conditions = [
    eq(workoutLogs.userId, memberId),
    sql`${workoutLogs.maxWeight} > 0`,
  ];

  const logs = await db.query.workoutLogs.findMany({
    where: eq(workoutLogs.userId, memberId),
    orderBy: [workoutLogs.logDate],
    with: {
      library: true,
      blueprint: {
        with: {
          program: true,
        },
      },
    },
  }).then(logs =>
    logs.filter(log => {
      if (libraryId && log.libraryId !== libraryId) return false;
      if (log.blueprint?.programId !== programId) return false;
      return parseFloat(log.maxWeight || "0") > 0;
    })
  );

  // 종목별로 그룹화하고 PR 이력 추출
  const prHistory = new Map<string, Array<{
    date: Date;
    weight: number;
    reps: number;
    volume: number;
    logId: string;
  }>>();

  logs.forEach(log => {
    const key = log.libraryId;
    if (!key) return;

    const weight = parseFloat(log.maxWeight || "0");
    const record = {
      date: log.logDate,
      weight,
      reps: parseFloat(log.totalVolume || "0") || 0,
      volume: parseFloat(log.totalVolume || "0") || 0,
      logId: log.id,
    };

    if (!prHistory.has(key)) {
      prHistory.set(key, []);
    }
    prHistory.get(key)!.push(record);
  });

  return prHistory;
};

/**
 * 회원의 현재 1RM 기록 조회 (상위 5개 종목)
 */
export const getMemberCurrentPRsQuery = async (
  memberId: string,
  programId: string
) => {
  const logs = await db.query.workoutLogs.findMany({
    where: eq(workoutLogs.userId, memberId),
    orderBy: [desc(workoutLogs.maxWeight)],
    with: {
      library: true,
      blueprint: {
        with: {
          program: true,
        },
      },
    },
  }).then(logs =>
    logs.filter(log => {
      if (log.blueprint?.programId !== programId) return false;
      return parseFloat(log.maxWeight || "0") > 0;
    })
  );

  // 종목별 최고 기록 추출
  const prMap = new Map<string, {
    libraryId: string;
    exerciseName: string;
    category: string | null;
    maxWeight: number;
    date: Date;
  }>();

  logs.forEach(log => {
    if (!log.library) return;

    const weight = parseFloat(log.maxWeight || "0");
    const existing = prMap.get(log.libraryId);

    if (!existing || weight > existing.maxWeight) {
      prMap.set(log.libraryId, {
        libraryId: log.libraryId,
        exerciseName: log.library.title,
        category: log.library.category,
        maxWeight: weight,
        date: log.logDate,
      });
    }
  });

  // 최고 기록 5개 반환
  return Array.from(prMap.values())
    .sort((a, b) => b.maxWeight - a.maxWeight)
    .slice(0, 5);
};

/**
 * 만료 임박 회원 조회
 */
export const getExpiringEnrollmentsQuery = async (
  programId: string,
  daysUntilExpiry: number = 7
) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

  return await db.query.enrollments.findMany({
    where: and(
      eq(enrollments.programId, programId),
      eq(enrollments.status, "ACTIVE"),
      gte(enrollments.endDate, new Date()),
      lte(enrollments.endDate, expiryDate)
    ),
    with: {
      user: {
        columns: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: [enrollments.endDate],
  });
};

/**
 * 회원 수강 상태별 통계
 */
export const getMemberStatsByProgramQuery = async (programId: string) => {
  const stats = await db
    .select({
      status: enrollments.status,
      count: count(),
    })
    .from(enrollments)
    .where(eq(enrollments.programId, programId))
    .groupBy(enrollments.status);

  const statsMap = {
    ACTIVE: 0,
    EXPIRED: 0,
    PAUSED: 0,
  };

  stats.forEach(stat => {
    statsMap[stat.status as keyof typeof statsMap] = Number(stat.count);
  });

  return statsMap;
};

/**
 * 회원 검색 (이름/이메일)
 */
export const searchMembersQuery = async (
  programId: string,
  searchTerm: string
) => {
  const enrollmentList = await db.query.enrollments.findMany({
    where: eq(enrollments.programId, programId),
    with: {
      user: true,
      program: true,
    },
  });

  // 검색어 필터링 (이름 또는 이메일)
  const filtered = enrollmentList.filter(
    enrollment =>
      (enrollment.user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enrollment.user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return filtered;
};
