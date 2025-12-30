"use server";

import { revalidatePath } from "next/cache";
import {
  createOrderQuery,
  getOrderByIdQuery,
  updateOrderStatusQuery,
  getOrdersByUserIdQuery,
  getOrdersByCoachIdQuery,
  createEnrollmentQuery,
  getEnrollmentByIdQuery,
  updateEnrollmentStatusQuery,
  getActiveEnrollmentsByUserIdQuery,
  getEnrollmentsByUserIdQuery,
  checkUserEnrollmentQuery,
  getEnrollmentsByProgramIdQuery,
  completeOrderAndCreateEnrollmentQuery,
} from "@/db/queries/order";
import { getProgramFullCurriculumQuery } from "@/db/queries/program";
import { getUserId } from "@/lib/auth/actions";

/**
 * ==========================================
 * ORDER (주문/결제) ACTIONS
 * ==========================================
 */

// 주문 생성 액션
export async function createOrderAction(programId: string, amount: string) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 프로그램 정보를 가져와서 coachId 확인
    const program = await getProgramFullCurriculumQuery(programId);
    if (!program) {
      return { success: false, message: "프로그램을 찾을 수 없습니다." };
    }

    const newOrder = await createOrderQuery({
      buyerId: userId,
      programId: programId,
      coachId: program.coachId,
      amount: amount,
      status: "PENDING",
    });

    return {
      success: true,
      data: newOrder,
    };
  } catch (error) {
    console.error("CREATE_ORDER_ERROR", error);
    return { success: false, message: "주문 생성에 실패했습니다." };
  }
}

// 주문 상태 업데이트 액션
export async function updateOrderStatusAction(
  orderId: string,
  status: "COMPLETED" | "CANCELLED",
  paymentKey?: string
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 주문 소유자 확인
    const order = await getOrderByIdQuery(orderId);
    if (!order) {
      return { success: false, message: "주문을 찾을 수 없습니다." };
    }

    if (order.buyerId !== userId) {
      return { success: false, message: "권한이 없습니다." };
    }

    const updatedOrder = await updateOrderStatusQuery(
      orderId,
      status,
      paymentKey
    );

    revalidatePath("/user/orders");
    return {
      success: true,
      data: updatedOrder,
    };
  } catch (error) {
    console.error("UPDATE_ORDER_STATUS_ERROR", error);
    return { success: false, message: "주문 상태 업데이트에 실패했습니다." };
  }
}

// 사용자의 주문 내역 조회 액션
export async function getMyOrdersAction() {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const orders = await getOrdersByUserIdQuery(userId);

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("GET_MY_ORDERS_ERROR", error);
    return { success: false, message: "주문 내역을 불러오는데 실패했습니다." };
  }
}

// 주문 상세 조회 액션
export async function getOrderDetailAction(orderId: string) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const order = await getOrderByIdQuery(orderId);

    if (!order) {
      return { success: false, message: "주문을 찾을 수 없습니다." };
    }

    // 주문 소유자 확인
    if (order.buyerId !== userId) {
      return { success: false, message: "권한이 없습니다." };
    }

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("GET_ORDER_DETAIL_ERROR", error);
    return { success: false, message: "주문 정보를 불러오는데 실패했습니다." };
  }
}

// 주문 완료 및 수강권 생성 액션 (결제 성공 시)
export async function completeOrderAndEnrollAction(
  orderId: string,
  paymentKey: string,
  endDate?: Date
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 주문 소유자 확인
    const order = await getOrderByIdQuery(orderId);
    if (!order) {
      return { success: false, message: "주문을 찾을 수 없습니다." };
    }

    if (order.buyerId !== userId) {
      return { success: false, message: "권한이 없습니다." };
    }

    const result = await completeOrderAndCreateEnrollmentQuery(
      orderId,
      paymentKey,
      endDate
    );

    revalidatePath("/user/orders");
    revalidatePath("/user/program");
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("COMPLETE_ORDER_AND_ENROLL_ERROR", error);
    return {
      success: false,
      message: "주문 완료 처리에 실패했습니다.",
    };
  }
}

/**
 * ==========================================
 * ENROLLMENT (수강 권한) ACTIONS
 * ==========================================
 */

// 수강 권한 생성 액션
export async function createEnrollmentAction(
  programId: string,
  orderId?: string,
  endDate?: Date
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const enrollment = await createEnrollmentQuery({
      userId: userId,
      programId: programId,
      orderId: orderId,
      status: "ACTIVE",
      endDate: endDate,
    });

    revalidatePath("/user/program");
    return {
      success: true,
      data: enrollment,
    };
  } catch (error) {
    console.error("CREATE_ENROLLMENT_ERROR", error);
    return { success: false, message: "수강 권한 생성에 실패했습니다." };
  }
}

// 수강 권한 상태 변경 액션
export async function updateEnrollmentStatusAction(
  enrollmentId: string,
  status: "ACTIVE" | "EXPIRED" | "PAUSED"
) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 수강권 소유자 확인
    const enrollment = await getEnrollmentByIdQuery(enrollmentId);

    if (!enrollment) {
      return { success: false, message: "수강권을 찾을 수 없습니다." };
    }

    if (enrollment.userId !== userId) {
      return { success: false, message: "권한이 없습니다." };
    }

    const updatedEnrollment = await updateEnrollmentStatusQuery(
      enrollmentId,
      status
    );

    revalidatePath("/user/program");
    return {
      success: true,
      data: updatedEnrollment,
    };
  } catch (error) {
    console.error("UPDATE_ENROLLMENT_STATUS_ERROR", error);
    return {
      success: false,
      message: "수강 권한 상태 변경에 실패했습니다.",
    };
  }
}

// 사용자의 활성 수강 프로그램 조회 액션
export async function getMyActiveEnrollmentsAction() {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const enrollments = await getActiveEnrollmentsByUserIdQuery(userId);

    return {
      success: true,
      data: enrollments,
    };
  } catch (error) {
    console.error("GET_MY_ACTIVE_ENROLLMENTS_ERROR", error);
    return {
      success: false,
      message: "수강 프로그램을 불러오는데 실패했습니다.",
    };
  }
}

// 특정 프로그램 수강 여부 확인 액션
export async function checkUserEnrollmentAction(programId: string) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const enrollment = await checkUserEnrollmentQuery(userId, programId);

    return {
      success: true,
      hasAccess: !!enrollment,
      data: enrollment,
    };
  } catch (error) {
    console.error("CHECK_USER_ENROLLMENT_ERROR", error);
    return {
      success: false,
      message: "수강 여부 확인에 실패했습니다.",
    };
  }
}
