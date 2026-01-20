"use client";

import { useState, useEffect, useRef } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface PaymentClientProps {
  program: {
    id: string;
    title: string;
    price: string;
    type: string;
    slug: string;
    accessPeriodDays: number | null;
    mainImageList?: string[] | null;
    durationWeeks?: number | null;
  };
  user: {
    email: string;
    fullName: string;
  };
}

export default function PaymentClient({ program, user }: PaymentClientProps) {
  const { toast } = useToast();
  const t = useTranslations("payment.client");
  const tError = useTranslations("payment.client.errors");
  const [paymentWidget, setPaymentWidget] = useState<unknown>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const isInitialized = useRef(false);

  const amount = Number(program.price);

  // 결제 위젯 로드
  useEffect(() => {
    // 이미 초기화됐으면 건너뛰기
    if (isInitialized.current) return;

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!clientKey) {
      toast({
        title: tError("setupError"),
        description: tError("setupErrorDesc"),
        variant: "destructive",
      });
      return;
    }

    // 즉시 초기화 상태로 설정
    isInitialized.current = true;

    const initWidget = async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

        // 금액 설정
        await widgets.setAmount({ value: amount, currency: "KRW" });

        // 결제 수단 위젯 렌더링
        await widgets.renderPaymentMethods({ selector: "#payment-methods" });

        setPaymentWidget(widgets);
        setWidgetReady(true);
      } catch (error) {
        console.error("Widget load error:", error);
        isInitialized.current = false;
        toast({
          title: tError("widgetLoadFailed"),
          description:
            error instanceof Error
              ? error.message
              : tError("widgetLoadFailedDesc"),
          variant: "destructive",
        });
      }
    };

    initWidget();

    // cleanup - DOM만 정리
    return () => {
      const element = document.getElementById("payment-methods");
      if (element) {
        element.innerHTML = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tError]);

  // 결제 요청
  const handlePayment = async () => {
    if (!paymentWidget) {
      toast({
        title: tError("widgetError"),
        description: tError("widgetNotReady"),
        variant: "destructive",
      });
      return;
    }

    try {
      await (
        paymentWidget as {
          requestPayment: (options: unknown) => Promise<unknown>;
        }
      ).requestPayment({
        orderId: `order-${Date.now()}-${program.id.substring(0, 8)}`,
        orderName: program.title,
        customerName: user.fullName || t("buyer"),
        customerEmail: user.email,
        successUrl: `${window.location.origin}/programs/success?programId=${program.slug}`,
        failUrl: `${window.location.origin}/programs/failed?programId=${program.slug}`,
      });
    } catch (error) {
      console.error("PAYMENT_ERROR", error);
      toast({
        title: tError("paymentError"),
        description: tError("paymentErrorDesc"),
        variant: "destructive",
      });
    }
  };

  const headingTextClassName = "font-bold text-primary";

  return (
    <div className="min-h-screen">
      <div className="container max-w-2xl mx-auto">
        <div className="space-y-4 px-4 py-6">
          <h2 className={headingTextClassName}>{t("programInfo")}</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <img
                src={program.mainImageList?.[0]}
                alt={program.title}
                className="w-20 h-20 rounded-md object-cover"
              />
              <div>
                <div className="font-bold">{program.title}</div>
                <p className="text-sm text-gray-600">
                  {`총 ${program.durationWeeks}주 프로그램 ∙ ${program.accessPeriodDays}일 소장 가능`}
                </p>
                <div className="text-2xl font-bold mt-2">
                  {amount.toLocaleString()}원
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 구매자 정보 */}
        <div className="space-y-4 px-4 py-6">
          <h2 className={headingTextClassName}>구매자 정보</h2>
          <div>
            <div className="text-sm text-gray-600">{t("email")}</div>
            <div className="font-medium">{user.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">{t("name")}</div>
            <div className="font-medium">{user.fullName}</div>
          </div>
        </div>
        <div className="space-y-4 px-4 py-6">
          <h2 className={headingTextClassName}>{t("paymentMethod")}</h2>

          {/* 결제 수단 선택 영역 */}
          <div className="min-h-[200px] relative">
            {!widgetReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
            <div id="payment-methods" className="min-h-[200px]" />
          </div>

          {/* 결제 버튼 */}
          {widgetReady && (
            <Button onClick={handlePayment} className="w-full mt-4 " size="xl">
              {t("payButton", { amount: amount.toLocaleString() })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
