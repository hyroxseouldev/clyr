import { getOrderDetailByCoachAction } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon, CalendarIcon, UserIcon, CreditCardIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations('order');

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
              {t('backToList')}
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {result.message || t('notFound')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const STATUS_LABELS = {
    PENDING: t('statusLabels.pending'),
    COMPLETED: t('statusLabels.completed'),
    CANCELLED: t('statusLabels.cancelled'),
  };

  const STATUS_VARIANTS = {
    PENDING: "secondary" as const,
    COMPLETED: "default" as const,
    CANCELLED: "destructive" as const,
  };

  // 포맷팅 함수
  const formatAmount = (amount: string) => {
    const num = Number(amount);
    return `${num.toLocaleString()}${t('won')}`;
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
          <h1 className="text-2xl font-bold tracking-tight">{t('detail')}</h1>
          <p className="text-muted-foreground">
            {t('orderNumber')}: {order.id.slice(0, 8)}...
          </p>
        </div>
        <Link href={`/coach/dashboard/${pid}/purchases`}>
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 size-4" />
            {t('backToList')}
          </Button>
        </Link>
      </div>

      {/* 주문 상태 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('status')}</CardTitle>
            <Badge variant={STATUS_VARIANTS[order.status]}>
              {STATUS_LABELS[order.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('orderDate')}</p>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('amount')}</p>
              <div className="flex items-center gap-2">
                <CreditCardIcon className="size-4 text-muted-foreground" />
                <p className="font-medium">{formatAmount(order.amount)}</p>
              </div>
            </div>
          </div>
          {order.paymentKey && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('paymentKey')}</p>
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
            {t('buyerInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('name')}</p>
            <p className="font-medium">
              {order.buyer.fullName || t('unregistered')}
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('email')}</p>
            <p className="font-medium">{order.buyer.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* 프로그램 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('programInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('programName')}</p>
            <p className="font-medium">{order.program.title}</p>
          </div>
          {order.program.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('description')}</p>
                <p className="text-sm">{order.program.description}</p>
              </div>
            </>
          )}
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('price')}</p>
            <p className="font-medium">{formatAmount(order.program.price)}</p>
          </div>
        </CardContent>
      </Card>

      {/* 수강권 정보 (있는 경우) */}
      {order.enrollments && order.enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('enrollmentInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            {order.enrollments.map((enrollment) => (
              <div key={enrollment.id} className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('status')}</p>
                    <Badge variant={enrollment.status === "ACTIVE" ? "default" : "secondary"}>
                      {enrollment.status === "ACTIVE"
                        ? t('statusLabels.active')
                        : enrollment.status === "EXPIRED"
                          ? t('statusLabels.expired')
                          : t('statusLabels.paused')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('startDate')}</p>
                    <p className="text-sm">
                      {enrollment.startDate
                        ? new Date(enrollment.startDate).toLocaleDateString("ko-KR")
                        : t('notSet')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('endDate')}</p>
                    <p className="text-sm">
                      {enrollment.endDate
                        ? new Date(enrollment.endDate).toLocaleDateString("ko-KR")
                        : t('indefinite')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('createdAt')}</p>
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
