import { eq, and, desc, sql, gte, lte, count } from "drizzle-orm";
import { enrollments, orders, programBlueprints, programs, account, userProfile } from "@/db/schema";
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

  return enrollmentList;
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
