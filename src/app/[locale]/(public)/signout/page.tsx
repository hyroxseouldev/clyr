import { redirect } from "next/navigation";
import { signOut } from "@/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { LogOutIcon } from "lucide-react";

/**
 * 로그아웃 페이지
 * 로그아웃 처리 후 메인 페이지로 리다이렉트
 */
export default async function SignoutPage() {
  // 로그아웃 처리
  const result = await signOut();

  // 로그아웃 후 메인 페이지로 리다이렉트
  // (에러가 있어도 리다이렉트 - 세션 만료 등의 경우)
  redirect("/");
}

// 로그아웃 처리 중 로딩 상태를 보여주는 fallback UI (optional)
export function SignoutFallback() {
  return (
    <div className="flex justify-center items-center h-screen min-h-screen">
      <Card className="w-full max-w-md p-8">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <LogOutIcon className="size-12 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">로그아웃 처리 중...</p>
        </CardContent>
      </Card>
    </div>
  );
}
