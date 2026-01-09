import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * next-intl 미들웨어 설정
 * 로케일 감지 및 URL 처리
 */
const intlMiddleware = createMiddleware({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'always',
});

/**
 * 통합 미들웨어
 * next-intl의 로케일 처리 + Supabase Auth 권한 제어
 */
export async function middleware(request: NextRequest) {
  // 1. 먼저 next-intl 미들웨어 실행 (로케일 처리)
  const intlResponse = intlMiddleware(request);

  // 2. 로케일이 처리된 후의 pathname으로 Supabase 세션 업데이트
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // 3. pathname에서 로케일 접두사 제거 (/ko/xxx → /xxx)
  const pathnameWithoutLocale = pathname.replace(/^\/(ko|en)(\/|$)/, '/');

  // 4. 로그인 상태라면 DB에서 Role 가져오기
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
  // 로케일 접두사가 제거된 pathname으로 체크

  // 1. 코치 전용 경로 (/coach)
  if (pathnameWithoutLocale.startsWith("/coach")) {
    if (!user || userRole !== "COACH") {
      // 로케일을 포함한 URL로 리다이렉트
      const locale = pathname.match(/^\/(ko|en)/)?.[1] || 'ko';
      return NextResponse.redirect(
        new URL(`/${locale}/signin?message=denied`, request.url)
      );
    }
  }

  // 2. 일반 유저 전용 경로 (/user)
  if (pathnameWithoutLocale.startsWith("/user")) {
    const isAuthPath =
      pathnameWithoutLocale.includes("/signin") ||
      pathnameWithoutLocale.includes("/signup");
    if (!isAuthPath && (!user || userRole !== "USER")) {
      const locale = pathname.match(/^\/(ko|en)/)?.[1] || 'ko';
      return NextResponse.redirect(
        new URL(`/${locale}/signin`, request.url)
      );
    }
  }

  // 3. 로그인 된 유저가 로그인 페이지 가려고 할 때 (역 리다이렉트)
  if (
    user &&
    (pathnameWithoutLocale === "/signin" || pathnameWithoutLocale === "/signup")
  ) {
    const locale = pathname.match(/^\/(ko|en)/)?.[1] || 'ko';
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const defaultDest =
      userRole === "COACH"
        ? `/${locale}/coach/dashboard`
        : `/${locale}/user/program`;
    const dest = redirectTo || defaultDest;
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // 4. 루트 경로(/) 접근 시 기본 로케일로 리다이렉트
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/ko", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // 모든 경로 매칭 (정적 파일 제외)
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
