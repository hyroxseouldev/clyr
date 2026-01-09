import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { orders, enrollments, programs } from "@/db/schema";
import { db } from "@/db";

/**
 * ==========================================
 * ORDER (주문/결제) QUERIES
 * ==========================================
 */

/**
 * 주문 생성
 */
export const createOrderQuery = async (data: typeof orders.$inferInsert) => {
  const [order] = await db.insert(orders).values(data).returning();
  return order;
};

/**
 * 주문 ID로 주문 조회
 */
export const getOrderByIdQuery = async (orderId: string) => {
  return await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      // 필요 시 program, buyer, coach 관계 추가 가능
    },
  });
};

/**
 * 주문 상태 업데이트
 */
export const updateOrderStatusQuery = async (
  orderId: string,
  status: "COMPLETED" | "CANCELLED",
  paymentKey?: string
) => {
  const [updatedOrder] = await db
    .update(orders)
    .set({ status, paymentKey: paymentKey ?? undefined })
    .where(eq(orders.id, orderId))
    .returning();
  return updatedOrder;
};

/**
 * 사용자의 주문 목록 조회
 */
export const getOrdersByUserIdQuery = async (userId: string) => {
  return await db.query.orders.findMany({
    where: eq(orders.buyerId, userId),
    orderBy: [desc(orders.createdAt)],
    with: {
      // program 정보 포함 가능
    },
  });
};

/**
 * 코치의 판매 주문 목록 조회
 */
export const getOrdersByCoachIdQuery = async (coachId: string) => {
  return await db.query.orders.findMany({
    where: eq(orders.coachId, coachId),
    orderBy: [desc(orders.createdAt)],
    with: {
      // program, buyer 정보 포함 가능
    },
  });
};

/**
 * ==========================================
 * ENROLLMENT (수강 권한) QUERIES
 * ==========================================
 */

/**
 * 수강 권한 생성
 */
export const createEnrollmentQuery = async (
  data: typeof enrollments.$inferInsert
) => {
  const [enrollment] = await db.insert(enrollments).values(data).returning();
  return enrollment;
};

/**
 * 수강 권한 ID로 조회
 */
export const getEnrollmentByIdQuery = async (enrollmentId: string) => {
  return await db.query.enrollments.findFirst({
    where: eq(enrollments.id, enrollmentId),
    with: {
      // program 정보 포함 가능
    },
  });
};

/**
 * 수강 권한 상태 업데이트
 */
export const updateEnrollmentStatusQuery = async (
  enrollmentId: string,
  status: "ACTIVE" | "EXPIRED" | "PAUSED"
) => {
  const [updatedEnrollment] = await db
    .update(enrollments)
    .set({ status })
    .where(eq(enrollments.id, enrollmentId))
    .returning();
  return updatedEnrollment;
};

/**
 * 수강권 시작일 업데이트
 */
export const updateEnrollmentStartDateQuery = async (
  enrollmentId: string,
  startDate: Date | null
) => {
  const [updatedEnrollment] = await db
    .update(enrollments)
    .set({ startDate })
    .where(eq(enrollments.id, enrollmentId))
    .returning();
  return updatedEnrollment;
};

/**
 * 수강권 종료일 업데이트 (연장)
 */
export const updateEnrollmentEndDateQuery = async (
  enrollmentId: string,
  endDate: Date | null
) => {
  const [updatedEnrollment] = await db
    .update(enrollments)
    .set({ endDate })
    .where(eq(enrollments.id, enrollmentId))
    .returning();
  return updatedEnrollment;
};

/**
 * 사용자의 활성 수강 프로그램 조회
 */
export const getActiveEnrollmentsByUserIdQuery = async (userId: string) => {
  return await db.query.enrollments.findMany({
    where: and(
      eq(enrollments.userId, userId),
      eq(enrollments.status, "ACTIVE")
    ),
    with: {
      // program 정보 포함
    },
    orderBy: [desc(enrollments.createdAt)],
  });
};

/**
 * 사용자의 모든 수강 프로그램 조회 (상태 무관)
 */
export const getEnrollmentsByUserIdQuery = async (userId: string) => {
  return await db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
    with: {
      user: true,
      program: true,
    },
    orderBy: [desc(enrollments.createdAt)],
  });
};

/**
 * 특정 프로그램의 수강 여부 확인 (활성 상태만)
 */
export const checkUserEnrollmentQuery = async (
  userId: string,
  programId: string
) => {
  return await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, userId),
      eq(enrollments.programId, programId),
      eq(enrollments.status, "ACTIVE")
    ),
  });
};

/**
 * 프로그램의 수강생 목록 조회
 */
export const getEnrollmentsByProgramIdQuery = async (programId: string) => {
  return await db.query.enrollments.findMany({
    where: eq(enrollments.programId, programId),
    with: {
      user: true, // 사용자 정보 포함
    },
    orderBy: [desc(enrollments.createdAt)],
  });
};

/**
 * ==========================================
 * COMPLEX TRANSACTIONS
 * ==========================================
 */

/**
 * 주문 완료 및 수강권 생성 (트랜잭션)
 */
export const completeOrderAndCreateEnrollmentQuery = async (
  orderId: string,
  paymentKey: string,
  endDate?: Date
) => {
  return await db.transaction(async (tx) => {
    // 1. 주문 상태 업데이트
    const [order] = await tx
      .update(orders)
      .set({ status: "COMPLETED", paymentKey })
      .where(eq(orders.id, orderId))
      .returning();

    if (!order) {
      throw new Error("Order not found");
    }

    // 2. 수강권 생성
    const [enrollment] = await tx
      .insert(enrollments)
      .values({
        userId: order.buyerId,
        programId: order.programId,
        orderId: order.id,
        status: "ACTIVE",
        endDate: endDate ?? null,
      })
      .returning();

    return { order, enrollment };
  });
};

/**
 * ==========================================
 * SALES & ANALYTICS QUERIES
 * ==========================================
 */

/**
 * 프로그램별 최근 주문 조회 (대시보드용)
 */
export const getRecentOrdersByProgramIdQuery = async (
  programId: string,
  limit: number = 10
) => {
  return await db.query.orders.findMany({
    where: and(
      eq(orders.programId, programId),
      eq(orders.status, "COMPLETED")
    ),
    orderBy: [desc(orders.createdAt)],
    limit,
    with: {
      buyer: {
        columns: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
};

/**
 * 프로그램별 월간 매출 집계 (최근 12개월)
 */
export const getProgramMonthlySalesQuery = async (programId: string) => {
  // 최근 12개월 데이터 조회
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlySales = await db
    .select({
      year: sql<number>`EXTRACT(YEAR FROM ${orders.createdAt})`,
      month: sql<number>`EXTRACT(MONTH FROM ${orders.createdAt})`,
      totalAmount: sql<number>`CAST(SUM(CAST(${orders.amount} AS NUMERIC)) AS BIGINT)`,
      orderCount: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.programId, programId),
        eq(orders.status, "COMPLETED"),
        gte(orders.createdAt, twelveMonthsAgo)
      )
    )
    .groupBy(
      sql`EXTRACT(YEAR FROM ${orders.createdAt})`,
      sql`EXTRACT(MONTH FROM ${orders.createdAt})`
    )
    .orderBy(
      sql`EXTRACT(YEAR FROM ${orders.createdAt})`,
      sql`EXTRACT(MONTH FROM ${orders.createdAt})`
    );

  return monthlySales.map((item) => ({
    year: Number(item.year),
    month: Number(item.month),
    totalAmount: Number(item.totalAmount) || 0,
    orderCount: Number(item.orderCount) || 0,
  }));
};

/**
 * 프로그램별 주문 목록 (페이지네이션)
 */
export const getProgramOrdersWithPaginationQuery = async (
  programId: string,
  page: number = 1,
  pageSize: number = 20
) => {
  const offset = (page - 1) * pageSize;

  const [ordersData, totalCount] = await Promise.all([
    db.query.orders.findMany({
      where: eq(orders.programId, programId),
      orderBy: [desc(orders.createdAt)],
      limit: pageSize,
      offset,
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
          },
        },
      },
    }),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(eq(orders.programId, programId)),
  ]);

  return {
    orders: ordersData,
    pagination: {
      page,
      pageSize,
      total: Number(totalCount[0]?.count || 0),
      totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / pageSize),
    },
  };
};

/**
 * 주문 상세 조회 (관계 포함)
 */
export const getOrderDetailByIdQuery = async (orderId: string) => {
  return await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      buyer: {
        columns: {
          id: true,
          email: true,
          fullName: true,
        },
      },
      coach: {
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
          description: true,
          price: true,
        },
      },
      enrollments: true,
    },
  });
};
