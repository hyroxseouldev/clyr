"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
  redirect(redirectPath);
}

// Signout Action
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  redirect("/");
}
