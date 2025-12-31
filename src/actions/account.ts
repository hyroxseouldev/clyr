"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserId } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * 계정 정보 수정
 */
export async function updateAccountAction(data: {
  fullName: string;
  avatarUrl?: string | null;
}) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // Supabase Auth 메타데이터 업데이트
    const supabase = await createClient();
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
      },
    });

    if (authError) {
      console.error("UPDATE_AUTH_ERROR", authError);
      return {
        success: false,
        message: "인증 정보 업데이트에 실패했습니다.",
      };
    }

    // DB 계정 정보 업데이트
    await db
      .update(account)
      .set({
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
      })
      .where(eq(account.id, userId));

    revalidatePath("/coach/dashboard");
    revalidatePath("/coach/profile");

    return {
      success: true,
      message: "계정 정보가 수정되었습니다.",
    };
  } catch (error) {
    console.error("UPDATE_ACCOUNT_ERROR", error);
    return {
      success: false,
      message: "계정 정보 수정에 실패했습니다.",
    };
  }
}

/**
 * 계정 삭제 (경고: 모든 데이터가 영구적으로 삭제됨)
 */
export async function deleteAccountAction() {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const supabase = await createClient();

    // 먼저 Supabase Auth에서 사용자 삭제
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("DELETE_AUTH_ERROR", authError);
      return {
        success: false,
        message: "인증 정보 삭제에 실패했습니다.",
      };
    }

    // DB 계정 정보는 cascade 삭제로 자동 처리됨
    // (coach_profile, programs 등이 account.id를 참조하며 onDelete: cascade 설정됨)

    return {
      success: true,
      message: "계정이 삭제되었습니다.",
    };
  } catch (error) {
    console.error("DELETE_ACCOUNT_ERROR", error);
    return {
      success: false,
      message: "계정 삭제에 실패했습니다.",
    };
  }
}

/**
 * 현재 로그인한 사용자의 계정 정보 조회
 */
export async function getMyAccountAction() {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const accounts = await db
      .select({
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        role: account.role,
        avatarUrl: account.avatarUrl,
        createdAt: account.createdAt,
      })
      .from(account)
      .where(eq(account.id, userId))
      .limit(1);

    if (accounts.length === 0) {
      return {
        success: false,
        message: "계정을 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      data: accounts[0],
    };
  } catch (error) {
    console.error("GET_ACCOUNT_ERROR", error);
    return {
      success: false,
      message: "계정 정보를 불러오는데 실패했습니다.",
    };
  }
}
