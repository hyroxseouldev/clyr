import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

/**
 * 결제 실패 페이지
 */
const PaymentFailedPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
    message?: string;
    programId?: string;
  }>;
}) => {
  const params = await searchParams;
  const { code, message, programId } = params;

  // 프로그램 ID가 있으면 결제 페이지로 돌아갈 수 있게
  const paymentUrl = programId ? `/programs/payment/${programId}` : "/programs";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {/* 실패 아이콘 */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </div>

          {/* 메시지 */}
          <h1 className="text-2xl font-bold mb-2">결제에 실패했습니다</h1>
          <p className="text-gray-600 mb-8">
            {message || "결제 처리 중 오류가 발생했습니다."}
            <br />
            다시 시도해 주세요.
          </p>

          {/* 에러 코드 (있는 경우) */}
          {code && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
              <div className="text-sm text-gray-600 mb-1">에러 코드</div>
              <div className="font-mono text-sm font-medium">{code}</div>
            </div>
          )}

          {/* 버튼 그룹 */}
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href={paymentUrl}>
                <RotateCcw className="h-4 w-4 mr-2" />
                다시 결제하기
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/programs">
                <Home className="h-4 w-4 mr-2" />
                프로그램 둘러보기
              </Link>
            </Button>
          </div>

          {/* 안내 문구 */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg text-left">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">⚠️ 안내</span>
              <br />
              결제가 계속 실패하는 경우 고객센터에 문의해 주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailedPage;
