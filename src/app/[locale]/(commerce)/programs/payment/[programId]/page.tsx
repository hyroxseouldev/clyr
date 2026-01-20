import { initPurchaseAction } from "@/actions/payment";
import { redirect } from "@/i18n/routing";
import PaymentClient from "./client-page";
import { getLocale } from "next-intl/server";

/**
 * 프로그램 결제 페이지 (Server Component)
 * 로그인 확인 후 결제 위젯 렌더링
 */
const PaymentPage = async ({
  params,
}: {
  params: Promise<{ programId: string }>;
}) => {
  const { programId } = await params;

  // 로그인 & 프로그램 확인
  const result = await initPurchaseAction(programId);
  const locale = await getLocale();

  if (!result.success && result.requiresAuth) {
    redirect({ href: result.redirectUrl, locale: locale });
  }

  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow-sm max-w-md border">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">결제 페이지 오류</h1>
          <p className="text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  // result.success가 true일 때 program과 user는 항상 존재
  if (!result.program || !result.user || !result.user.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow-sm max-w-md border">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">결제 페이지 오류</h1>
          <p className="text-muted-foreground">프로그램 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const { program, user } = result;

  return (
    <PaymentClient
      program={program}
      user={{ email: user.email, fullName: user.fullName }}
    />
  );
};

export default PaymentPage;
