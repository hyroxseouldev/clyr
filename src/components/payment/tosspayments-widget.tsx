"use client";

import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";

interface TossPaymentsWidgetProps {
  amount: number;
}

/**
 * 토스페이먼츠 결제 위젯 컴포넌트
 * 결제 수단 선택과 약관 동의 UI를 렌더링합니다.
 */
export function TossPaymentsWidget({ amount }: TossPaymentsWidgetProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!clientKey) {
      setLoading(false);
      return;
    }

    const initWidget = async () => {
      try {
        // 결제 위젯 로드
        const tossPayments = await loadTossPayments(clientKey, ANONYMOUS);
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

        // 금액 설정
        await widgets.setAmount({ value: amount, currency: "KRW" });

        // 결제 위젯 렌더링
        const paymentMethodsElement = document.getElementById("payment-methods");

        if (paymentMethodsElement) {
          await widgets.renderPaymentMethods({ selector: "#payment-methods" });
        }

        setLoading(false);
      } catch (error) {
        console.error("Widget load error:", error);
        setLoading(false);
      }
    };

    initWidget();
  }, [amount]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-12 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      <div id="payment-methods" className="min-h-[200px]" />
    </div>
  );
}
