"use server";

import { getProgramByIdQuery } from "@/db/queries/program";
import { getMemberStatsByProgramQuery } from "@/db/queries/member";
import {
  getRecentOrdersByProgramIdQuery,
  getProgramOrdersWithPaginationQuery,
} from "@/db/queries/order";
import { getUserId } from "@/actions/auth";

/**
 * ==========================================
 * DASHBOARD (대시보드) ACTIONS
 * ==========================================
 */

/**
 * Get dashboard statistics for a program
 */
export async function getDashboardStatsAction(programId: string) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 1. Verify program ownership
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    // 2. Get member statistics
    const memberStats = await getMemberStatsByProgramQuery(programId);

    // 3. Get all orders for revenue calculation
    const { orders } = await getProgramOrdersWithPaginationQuery(programId, 1, 1000);

    // 4. Calculate statistics
    const totalSales = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + Number(o.amount), 0);

    const activeUsers = memberStats.ACTIVE || 0;
    const completionRate = 0; // TODO: Calculate from workout completion data

    return {
      success: true,
      data: {
        totalSales,
        totalRevenue,
        activeUsers,
        completionRate,
      },
    };
  } catch (error) {
    console.error("GET_DASHBOARD_STATS_ERROR", error);
    return {
      success: false,
      message: "대시보드 데이터를 불러오는데 실패했습니다.",
    };
  }
}

/**
 * Get recent purchase activity for dashboard
 */
export async function getRecentPurchasesAction(
  programId: string,
  limit: number = 10
) {
  const coachId = await getUserId();

  if (!coachId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // Verify program ownership
    const program = await getProgramByIdQuery(programId);

    if (!program || program.coachId !== coachId) {
      return { success: false, message: "권한이 없습니다." };
    }

    const recentOrders = await getRecentOrdersByProgramIdQuery(programId, limit);

    return {
      success: true,
      data: recentOrders.map((order) => ({
        id: order.id,
        userName: order.buyer?.fullName || order.buyer?.email || "알 수 없음",
        date: order.createdAt,
        amount: Number(order.amount),
      })),
    };
  } catch (error) {
    console.error("GET_RECENT_PURCHASES_ERROR", error);
    return {
      success: false,
      message: "최근 구매 내역을 불러오는데 실패했습니다.",
    };
  }
}
