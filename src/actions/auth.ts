"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { account } from "@/db/schema";
import { getLocale } from "next-intl/server";
import {
  createCoachProfileQuery,
  getCoachProfileByAccountIdQuery,
  getCoachProfileByIdQuery,
  updateCoachProfileQuery,
  deleteCoachProfileQuery,
} from "@/db/queries/coach";

export async function signInWithEmailAndPassword(
  email: string,
  password: string
) {
  const supabase = await createClient();

  // 1. 로그인 시도
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 에러 발생 시 즉시 객체 반환 (클라이언트의 form.setError 등에 활용)
  if (error) {
    return { error: error.message };
  }

  // 2. 로그인 성공 후 사용자 권한(Role) 확인
  const { data: account, error: accountError } = await supabase
    .from("account")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (accountError || !account) {
    // 계정 정보가 없는 경우 처리
    return { error: "사용자 권한 정보를 찾을 수 없습니다." };
  }

  // 3. 리다이렉트 경로 결정
  let redirectPath = "/user/program";
  if (account.role === "COACH") {
    redirectPath = "/coach/dashboard"; // 처음에 설계하신 코치 전용 경로
  }

  // 4. redirect는 함수의 가장 마지막에 호출 (try-catch를 쓸 경우 반드시 밖에서 호출)
  const locale = await getLocale();
  redirect({ href: redirectPath, locale });
}

// Signout Action
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  const locale = await getLocale();
  redirect({ href: "/", locale });
}

/**
 * 비밀번호 재설정 요청 (이메일 발송)
 */
export async function requestPasswordResetAction(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "비밀번호 재설정 링크가 발송되었습니다." };
}

/**
 * 비밀번호 재설정 (이메일 링크 통해)
 */
export async function resetPasswordAction(data: { password: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "비밀번호가 변경되었습니다." };
}

/**
 * 비밀번호 변경
 */
export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const supabase = await createClient();

  // 1. 현재 사용자 확인
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  // 2. 현재 비밀번호 확인을 위해 재로그인 시도
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: data.currentPassword,
  });

  if (signInError) {
    return { success: false, message: "현재 비밀번호가 올바르지 않습니다." };
  }

  // 3. 새 비밀번호로 변경
  const { error: updateError } = await supabase.auth.updateUser({
    password: data.newPassword,
  });

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  return { success: true, message: "비밀번호가 변경되었습니다." };
}

/**
 * 회원가입 액션
 * Supabase Auth 사용자 생성 후 계정 정보 저장
 */
export async function signUpAction(data: {
  email: string;
  password: string;
  fullName: string;
  avatarUrl: string;
  role: "USER" | "COACH";
}) {
  const supabase = await createClient();

  // 1. Supabase Auth 사용자 생성
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        role: data.role,
        avatar_url: data.avatarUrl,
      },
    },
  });

  if (authError) {
    return {
      success: false,
      message: authError.message,
    };
  }

  if (!authData.user) {
    return {
      success: false,
      message: "사용자 생성에 실패했습니다.",
    };
  }
  return {
    success: true,
    message: "회원가입이 완료되었습니다. 이메일 인증 후 로그인 해주세요.",
  };
}

// Get User ID
export async function getUserId() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

/**
 * ==========================================
 * COACH PROFILE CRUD ACTIONS
 * ==========================================
 */

/**
 * 코치 프로필 생성
 */
export async function createCoachProfileAction(data: {
  profileImageUrl?: string | null;
  nickname?: string | null;
  introduction?: string | null;
  experience?: string | null;
  certifications?: string[];
  contactNumber?: string | null;
  snsLinks?: {
    instagram?: string;
    youtube?: string;
    blog?: string;
  };
}) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 이미 프로필이 있는지 확인
    const existing = await getCoachProfileByAccountIdQuery(userId);
    if (existing) {
      return {
        success: false,
        message: "이미 프로필이 존재합니다. 수정 기능을 사용해주세요.",
      };
    }

    const profile = await createCoachProfileQuery({
      accountId: userId,
      profileImageUrl: data.profileImageUrl ?? null,
      nickname: data.nickname ?? null,
      introduction: data.introduction ?? null,
      experience: data.experience ?? null,
      certifications: data.certifications ?? [],
      contactNumber: data.contactNumber ?? null,
      snsLinks: data.snsLinks ?? {},
    });

    revalidatePath("/coach/profile");
    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("CREATE_COACH_PROFILE_ERROR", error);
    return {
      success: false,
      message: "프로필 생성에 실패했습니다.",
    };
  }
}

/**
 * 코치 프로필 조회 (현재 로그인한 사용자)
 */
export async function getMyCoachProfileAction() {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    const profile = await getCoachProfileByAccountIdQuery(userId);

    if (!profile) {
      return {
        success: false,
        message: "프로필을 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("GET_COACH_PROFILE_ERROR", error);
    return {
      success: false,
      message: "프로필을 불러오는데 실패했습니다.",
    };
  }
}

/**
 * 코치 프로필 수정
 */
export async function updateCoachProfileAction(data: {
  profileImageUrl?: string | null;
  nickname?: string | null;
  introduction?: string | null;
  experience?: string | null;
  certifications?: string[];
  contactNumber?: string | null;
  snsLinks?: {
    instagram?: string;
    youtube?: string;
    blog?: string;
  };
}) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 프로필 존재 확인
    const existing = await getCoachProfileByAccountIdQuery(userId);
    if (!existing) {
      return {
        success: false,
        message: "프로필이 존재하지 않습니다. 먼저 프로필을 생성해주세요.",
      };
    }

    const updatedProfile = await updateCoachProfileQuery(userId, {
      profileImageUrl: data.profileImageUrl,
      nickname: data.nickname,
      introduction: data.introduction,
      experience: data.experience,
      certifications: data.certifications,
      contactNumber: data.contactNumber,
      snsLinks: data.snsLinks,
    });

    revalidatePath("/coach/profile");
    return {
      success: true,
      data: updatedProfile,
    };
  } catch (error) {
    console.error("UPDATE_COACH_PROFILE_ERROR", error);
    return {
      success: false,
      message: "프로필 수정에 실패했습니다.",
    };
  }
}

/**
 * 코치 프로필 삭제
 */
export async function deleteCoachProfileAction() {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, message: "인증되지 않은 사용자입니다." };
  }

  try {
    // 프로필 존재 확인
    const existing = await getCoachProfileByAccountIdQuery(userId);
    if (!existing) {
      return {
        success: false,
        message: "프로필이 존재하지 않습니다.",
      };
    }

    await deleteCoachProfileQuery(userId);

    revalidatePath("/coach/profile");
    return { success: true };
  } catch (error) {
    console.error("DELETE_COACH_PROFILE_ERROR", error);
    return {
      success: false,
      message: "프로필 삭제에 실패했습니다.",
    };
  }
}
