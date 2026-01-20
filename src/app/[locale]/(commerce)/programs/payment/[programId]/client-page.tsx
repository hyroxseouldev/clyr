"use client";

import { useState, useEffect, useRef } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

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
    daysPerWeek?: number | null;
    programImage?: string | null;
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
  const locale = useLocale();
  const [paymentWidget, setPaymentWidget] = useState<unknown>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const isInitialized = useRef(false);
  const amount = Number(program.price);

  // Format currency based on locale
  const formatCurrency = (amount: number) => {
    if (locale === "ko") {
      return `${amount.toLocaleString()}원`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

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

  // Get thumbnail image
  const thumbnailImage = program.mainImageList?.[0] || program.programImage;

  // Calculate access period text
  const accessPeriodText = program.accessPeriodDays
    ? `${program.accessPeriodDays}`
    : t("lifetime");

  return (
    <div className="min-h-screen pb-32">
      <div className="container max-w-2xl mx-auto">
        {/* 프로그램 정보 */}
        <div className="space-y-4 px-4 py-6">
          <h2 className={headingTextClassName}>{t("programInfo")}</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-4">
              {thumbnailImage && (
                <img
                  src={thumbnailImage}
                  alt={program.title}
                  className="w-20 h-20 rounded-md object-cover"
                />
              )}
              <div>
                <div className="font-bold">{program.title}</div>
                {program.durationWeeks && (
                  <p className="text-sm text-muted-foreground">
                    {t("programInfoText", {
                      weeks: program.durationWeeks,
                      days: accessPeriodText,
                    })}
                  </p>
                )}
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(amount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 구매자 정보 */}
        <div className="space-y-2 px-4 py-6">
          <h2 className={headingTextClassName}>{t("buyerInfo")}</h2>
          <div>
            <div className="text-sm text-muted-foreground">{t("email")}</div>
            <div className="font-medium">{user.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t("name")}</div>
            <div className="font-medium">{user.fullName}</div>
          </div>
        </div>

        {/* 결제 수단 */}
        <div className="space-y-4 px-4 py-6">
          <h2 className={headingTextClassName}>{t("paymentMethod")}</h2>

          {/* 결제 수단 선택 영역 */}
          <div className="min-h-[200px] relative">
            {!widgetReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <div id="payment-methods" className="min-h-[200px]" />
          </div>
        </div>
      </div>

      {/* 결제 버튼 - 하단 고정 */}
      {widgetReady && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background shadow-lg z-50">
          <div className="container max-w-2xl mx-auto p-4">
            <Button onClick={handlePayment} className="w-full" size="xl">
              {t("payButton", { amount: formatCurrency(amount) })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
