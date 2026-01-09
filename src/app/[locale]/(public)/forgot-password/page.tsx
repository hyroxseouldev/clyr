import { Link } from "@/i18n/routing";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getTranslations } from "next-intl/server";

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth.forgotPassword');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* 로고 및 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">CLYR</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>

        {/* 로그인으로 돌아가기 링크 */}
        <div className="text-center">
          <Link
            href="/signin"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← {t('backToSignIn')}
          </Link>
        </div>

        {/* 비밀번호 재설정 폼 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
