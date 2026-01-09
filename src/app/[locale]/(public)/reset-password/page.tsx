import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 비밀번호 재설정 링크를 통해서만 접근 가능
  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* 로고 및 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">CLYR</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            새 비밀번호를 입력해주세요
          </p>
        </div>

        {/* 비밀번호 재설정 폼 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
