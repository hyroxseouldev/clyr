import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, User } from "lucide-react";
import Link from "next/link";
import { processPaymentSuccessAction } from "@/actions/payment";

/**
 * 결제 성공 페이지
 */
const PaymentSuccessPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
    programId?: string;
  }>;
}) => {
  const params = await searchParams;
  const { paymentKey, orderId, amount, programId } = params;

  // 필수 파라미터 확인
  if (!paymentKey || !orderId || !amount || !programId) {
    redirect("/programs");
  }

  // 결제 성공 처리
  const result = await processPaymentSuccessAction({
    paymentKey,
    tossOrderId: orderId,
    amount,
    programId,
  });

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">
              결제 처리 오류
            </h1>
            <p className="text-gray-600 mb-6">{result.error}</p>
            <Button asChild variant="outline">
              <Link href="/programs">프로그램 목록으로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {/* 성공 아이콘 */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>

          {/* 메시지 */}
          <h1 className="text-2xl font-bold mb-2">결제가 완료되었습니다</h1>
          <p className="text-gray-600 mb-8">
            수강 프로그램이 등록되었습니다.
            <br />
            지금 바로 수강을 시작하세요!
          </p>

          {/* 주문 정보 */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
              <div className="text-sm text-gray-600 mb-1">주문 번호</div>
              <div className="font-mono text-sm font-medium">{orderId}</div>
            </div>
          )}

          {/* 앱 안내 문구 */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm text-green-800 text-left">
                  <p className="font-medium mb-1">앱에서 바로 시작하세요!</p>
                  <p className="text-green-700">
                    앱을 다운로드하고 구매 내역을 확인한 후 프로그램을
                    시작하세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
