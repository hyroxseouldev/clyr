"use server";

import { revalidatePath } from "next/cache";
import { getProgramBySlugQuery } from "@/db/queries";
import {
  createOrderQuery,
  completeOrderAndCreateEnrollmentQuery,
  createEnrollmentQuery,
} from "@/db/queries/order";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/actions/auth";

/**
 * ==========================================
 * PAYMENT (결제) ACTIONS
 * ==========================================
 */

/**
 * 구매 시작 - 로그인 확인 및 프로그램 검증
 * @param programSlug - 프로그램 slug
 * @returns 로그인 상태에 따른 리다이렉트 URL 또는 프로그램 정보
 */
export async function initPurchaseAction(programSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. 로그인 확인
  if (!user) {
    return {
      success: false,
      requiresAuth: true,
      redirectUrl: `/signin?redirectTo=/programs/payment/${programSlug}`,
    };
  }

  // 2. 프로그램 정보 조회
  const program = await getProgramBySlugQuery(programSlug);

  if (!program) {
    return { success: false, error: "프로그램을 찾을 수 없습니다" };
  }

  // 3. 판매 중인 프로그램인지 확인
  if (!program.isForSale) {
    return { success: false, error: "현재 판매하지 않는 프로그램입니다" };
  }

  // 4. 이메일 확인 (결제에 필수)
  if (!user.email) {
    return { success: false, error: "이메일 정보가 필요합니다" };
  }

  // 5. 결제 페이지에 필요한 정보 반환
  return {
    success: true,
    program: {
      id: program.id,
      title: program.title,
      price: program.price,
      type: program.type,
      slug: program.slug,
      accessPeriodDays: program.accessPeriodDays,
    },
    user: {
      email: user.email,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name || "",
    },
  };
}

/**
 * 결제 완료 처리 - 주문 생성 및 결제 승인
 * @param programId - 프로그램 ID
 * @param paymentKey - 토스페이먼츠 결제 키
 * @param amount - 결제 금액
 * @param orderId - 주문 ID (선택, 없으면 새로 생성)
 */
export async function createPaymentAction({
  programId,
  paymentKey,
  amount,
  orderId,
}: {
  programId: string;
  paymentKey: string;
  amount: string;
  orderId?: string;
}) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, error: "인증되지 않은 사용자입니다" };
  }

  try {
    // 1. 프로그램 정보 조회 (가격 검증을 위해)
    const program = await getProgramBySlugQuery(programId);
    if (!program) {
      return { success: false, error: "프로그램을 찾을 수 없습니다" };
    }

    // 2. 금액 검증
    const programPrice = program.price.toString();
    if (programPrice !== amount) {
      console.error("PAYMENT_AMOUNT_MISMATCH", {
        expected: programPrice,
        received: amount,
      });
      return { success: false, error: "결제 금액이 일치하지 않습니다" };
    }

    // 3. 주문 생성 (orderId가 없는 경우)
    let finalOrderId = orderId;
    if (!finalOrderId) {
      const newOrder = await createOrderQuery({
        buyerId: userId,
        programId: program.id,
        coachId: program.coachId,
        amount: amount,
        status: "PENDING",
        paymentKey: paymentKey,
      });
      finalOrderId = newOrder.id;
    }

    // 4. 결제 승인 (토스페이먼츠 API)
    const approvalResult = await approvePayment(
      paymentKey,
      finalOrderId,
      amount
    );

    if (!approvalResult.success) {
      // 결제 실패 시 주문 상태 업데이트
      await updateOrderStatusQuery(finalOrderId, "CANCELLED");
      return {
        success: false,
        error: approvalResult.error || "결제 승인 실패",
      };
    }

    // 5. 수강 만료일 계산
    const endDate = program.accessPeriodDays
      ? new Date(Date.now() + program.accessPeriodDays * 24 * 60 * 60 * 1000)
      : undefined;

    // 6. 주문 완료 및 수강권 생성
    await completeOrderAndCreateEnrollmentQuery(
      finalOrderId,
      paymentKey,
      endDate
    );

    revalidatePath(`/programs/payment/${programId}`);
    revalidatePath("/user/orders");
    revalidatePath("/user/program");

    return {
      success: true,
      orderId: finalOrderId,
      redirectUrl: `/programs/success?orderId=${finalOrderId}`,
    };
  } catch (error) {
    console.error("CREATE_PAYMENT_ERROR", error);
    return { success: false, error: "결제 처리에 실패했습니다" };
  }
}

/**
 * 토스페이먼츠 결제 승인 API 호출
 * @param paymentKey - 결제 키
 * @param orderId - 주문 ID
 * @param amount - 결제 금액
 */
async function approvePayment(
  paymentKey: string,
  orderId: string,
  amount: string
) {
  const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;

  if (!secretKey) {
    console.error("TOSS_PAYMENTS_SECRET_KEY is not set");
    return { success: false, error: "결제 설정 오류" };
  }

  try {
    const response = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(secretKey + ":").toString(
            "base64"
          )}`,
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: amount,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("TOSS_PAYMENT_APPROVAL_ERROR", data);
      return {
        success: false,
        error: data.message || "결제 승인 실패",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("TOSS_PAYMENT_API_ERROR", error);
    return { success: false, error: "결제 API 호출 실패" };
  }
}

/**
 * 주문 상태 업데이트 (내부 함수)
 */
async function updateOrderStatusQuery(
  orderId: string,
  status: "COMPLETED" | "CANCELLED"
) {
  const { updateOrderStatusQuery } = await import("@/db/queries/order");
  await updateOrderStatusQuery(orderId, status);
}

/**
 * 결제 위젯용 클라이언트 키 반환
 */
export async function getTossClientKeyAction() {
  const clientKey = process.env.TOSS_PAYMENTS_CLIENT_KEY;
  return {
    success: !!clientKey,
    clientKey: clientKey || "",
  };
}

/**
 * 결제 성공 후 처리 - 결제 승인, 주문 생성, 수강권 생성
 * @param paymentKey - 토스페이먼츠 결제 키
 * @param tossOrderId - 토스페이먼츠 주문 ID
 * @param amount - 결제 금액
 * @param programId - 프로그램 ID
 */
export async function processPaymentSuccessAction(params: {
  paymentKey: string;
  tossOrderId: string;
  amount: string;
  programId: string;
}) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, error: "인증되지 않은 사용자입니다" };
  }

  try {
    // 1. 프로그램 정보 조회
    const program = await getProgramBySlugQuery(params.programId);
    if (!program) {
      return { success: false, error: "프로그램을 찾을 수 없습니다" };
    }

    // 2. 금액 검증
    const programPrice = program.price.toString();
    if (programPrice !== params.amount) {
      console.error("PAYMENT_AMOUNT_MISMATCH", {
        expected: programPrice,
        received: params.amount,
      });
      return { success: false, error: "결제 금액이 일치하지 않습니다" };
    }

    // 3. 결제 승인 요청 (토스페이먼츠 API)
    const approvalResult = await approvePayment(
      params.paymentKey,
      params.tossOrderId,
      params.amount
    );

    if (!approvalResult.success) {
      return {
        success: false,
        error: approvalResult.error || "결제 승인 실패",
      };
    }

    // 4. 주문 생성
    const order = await createOrderQuery({
      buyerId: userId,
      programId: program.id,
      coachId: program.coachId,
      amount: params.amount,
      status: "COMPLETED",
      paymentKey: params.paymentKey,
    });

    // 5. 수강 만료일 계산
    const endDate = program.accessPeriodDays
      ? new Date(Date.now() + program.accessPeriodDays * 24 * 60 * 60 * 1000)
      : undefined;

    // 6. 수강권 생성
    await createEnrollmentQuery({
      userId: userId,
      programId: program.id,
      orderId: order.id,
      status: "ACTIVE",
      endDate: endDate ?? null,
    });

    return {
      success: true,
      orderId: order.id,
      programId: program.id,
      programSlug: program.slug,
    };
  } catch (error) {
    console.error("PROCESS_PAYMENT_SUCCESS_ERROR", error);
    return { success: false, error: "결제 처리에 실패했습니다" };
  }
}
