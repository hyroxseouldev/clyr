import { eq, and, desc } from "drizzle-orm";
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
      // program 정보 포함
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
      // user 정보 포함 가능
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
