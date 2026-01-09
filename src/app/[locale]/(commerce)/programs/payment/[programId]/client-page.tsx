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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
          <p className="text-gray-600">{t("description")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 왼쪽: 결제 정보 */}
          <div className="space-y-6">
            {/* 프로그램 정보 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4">{t("programInfo")}</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">{t("programName")}</div>
                    <div className="font-medium">{program.title}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-gray-600">{t("amount")}</div>
                    <div className="text-2xl font-bold">
                      {amount.toLocaleString()}원
                    </div>
                  </div>
                  {program.accessPeriodDays && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-gray-600">{t("accessPeriod")}</div>
                        <div className="font-medium">
                          {program.accessPeriodDays}{t("days")}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 구매자 정보 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4">{t("buyerInfo")}</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">{t("email")}</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-gray-600">{t("name")}</div>
                    <div className="font-medium">{user.fullName}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 결제 위젯 */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4">{t("paymentMethod")}</h2>

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
                  <Button
                    onClick={handlePayment}
                    className="w-full mt-4"
                    size="lg"
                  >
                    {t("payButton", { amount: amount.toLocaleString() })}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 안내 문구 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">{t("safePayment")}</p>
                    <p className="text-blue-700">
                      {t("safePaymentDesc")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
