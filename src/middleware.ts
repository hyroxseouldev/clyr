import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 가상의 유저 세션 정보 (실제로는 쿠키나 Auth 라이브러리에서 가져옴)
  const user = {
    isLoggedIn: false,
    role: "USER", // 'ADMIN' | 'COACH' | 'USER'
  };

  // 1. 코치 전용 경로 보호
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/coach")) {
    if (!user.isLoggedIn || user.role !== "COACH") {
      return NextResponse.redirect(
        new URL("/signin?message=denied", request.url)
      );
    }
  }

  // 2. 유저 전용 경로 보호
  if (pathname.startsWith("/user")) {
    // 유저의 signin/signup은 public이므로 제외 로직 필요
    const isAuthPath =
      pathname.includes("/signin") || pathname.includes("/signup");

    if (!isAuthPath && (!user.isLoggedIn || user.role !== "USER")) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // 미들웨어가 실행될 경로 설정
  matcher: ["/dashboard/:path*", "/coach/:path*", "/user/:path*"],
};
