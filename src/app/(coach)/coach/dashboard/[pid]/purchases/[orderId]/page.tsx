import { getOrderDetailByCoachAction } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon, CalendarIcon, UserIcon, CreditCardIcon } from "lucide-react";
import Link from "next/link";

/**
 * 주문 상세 페이지
 * 코치가 자신의 프로그램 주문 상세 정보를 확인합니다.
 */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ pid: string; orderId: string }>;
}) {
  const { pid, orderId } = await params;

  // 주문 상세 정보 조회
  const result = await getOrderDetailByCoachAction(orderId);
  const order = result.success ? result.data : null;

  if (!result.success || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/coach/dashboard/${pid}/purchases`}>
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="mr-2 size-4" />
              목록으로
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {result.message || "주문을 찾을 수 없습니다."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const STATUS_LABELS = {
    PENDING: "대기",
    COMPLETED: "완료",
    CANCELLED: "취소",
  };

  const STATUS_VARIANTS = {
    PENDING: "secondary" as const,
    COMPLETED: "default" as const,
    CANCELLED: "destructive" as const,
  };

  // 포맷팅 함수
  const formatAmount = (amount: string) => {
    const num = Number(amount);
    return `${num.toLocaleString()}원`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">주문 상세</h1>
          <p className="text-muted-foreground">
            주문 번호: {order.id.slice(0, 8)}...
          </p>
        </div>
        <Link href={`/coach/dashboard/${pid}/purchases`}>
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 size-4" />
            목록으로
          </Button>
        </Link>
      </div>

      {/* 주문 상태 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>주문 상태</CardTitle>
            <Badge variant={STATUS_VARIANTS[order.status]}>
              {STATUS_LABELS[order.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">주문 일시</p>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">결제 금액</p>
              <div className="flex items-center gap-2">
                <CreditCardIcon className="size-4 text-muted-foreground" />
                <p className="font-medium">{formatAmount(order.amount)}</p>
              </div>
            </div>
          </div>
          {order.paymentKey && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">결제 키</p>
              <p className="font-mono text-sm">{order.paymentKey}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 구매자 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="size-5" />
            구매자 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">이름</p>
            <p className="font-medium">
              {order.buyer.fullName || "미등록"}
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground mb-1">이메일</p>
            <p className="font-medium">{order.buyer.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* 프로그램 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>프로그램 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">프로그램명</p>
            <p className="font-medium">{order.program.title}</p>
          </div>
          {order.program.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">설명</p>
                <p className="text-sm">{order.program.description}</p>
              </div>
            </>
          )}
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground mb-1">판매가</p>
            <p className="font-medium">{formatAmount(order.program.price)}</p>
          </div>
        </CardContent>
      </Card>

      {/* 수강권 정보 (있는 경우) */}
      {order.enrollments && order.enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>수강권 정보</CardTitle>
          </CardHeader>
          <CardContent>
            {order.enrollments.map((enrollment) => (
              <div key={enrollment.id} className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">상태</p>
                    <Badge variant={enrollment.status === "ACTIVE" ? "default" : "secondary"}>
                      {enrollment.status === "ACTIVE" ? "활성" : enrollment.status === "EXPIRED" ? "만료" : "정지"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">시작일</p>
                    <p className="text-sm">
                      {enrollment.startDate
                        ? new Date(enrollment.startDate).toLocaleDateString("ko-KR")
                        : "미설정"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">종료일</p>
                    <p className="text-sm">
                      {enrollment.endDate
                        ? new Date(enrollment.endDate).toLocaleDateString("ko-KR")
                        : "무기한"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">생성일</p>
                    <p className="text-sm">
                      {new Date(enrollment.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
