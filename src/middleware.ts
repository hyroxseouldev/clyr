import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 1. 세션 업데이트 및 유저/클라이언트 가져오기
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // 2. 로그인 상태라면 DB에서 Role 가져오기
  let userRole = null;
  if (user) {
    const { data: account } = await supabase
      .from("account")
      .select("role")
      .eq("id", user.id)
      .single();
    userRole = account?.role;
  }

  // --- [권한 제어 로직] ---

  // 1. 코치 전용 경로 (/coach)
  if (pathname.startsWith("/coach")) {
    if (!user || userRole !== "COACH") {
      return NextResponse.redirect(
        new URL("/signin?message=denied", request.url)
      );
    }
  }

  // 2. 일반 유저 전용 경로 (/user)
  if (pathname.startsWith("/user")) {
    const isAuthPath =
      pathname.includes("/signin") || pathname.includes("/signup");
    if (!isAuthPath && (!user || userRole !== "USER")) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  // 3. 로그인 된 유저가 로그인 페이지 가려고 할 때 (역 리다이렉트)
  if (user && (pathname === "/signin" || pathname === "/signup")) {
    // redirectTo 파라미터가 있으면 해당 페이지로, 없으면 기본 대시보드로
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const defaultDest = userRole === "COACH" ? "/coach/dashboard" : "/user/program";
    const dest = redirectTo || defaultDest;
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
