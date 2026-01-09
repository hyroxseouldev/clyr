# 프로그램 결제 기능 PRD

## 개요
사용자가 프로그램 상세 페이지에서 구매하기 버튼을 클릭하여 토스페이먼츠 결제위젯을 통해 결제를 완료하는 기능

## 참고 문서
- [토스페이먼츠 결제위젯 가이드](https://docs.tosspayments.com/guides/v2/payment-widget)

---

## 1. 사용자 흐름

```
프로그램 상세 페이지
    ↓
[구매하기] 버튼 클릭
    ↓
┌─────────────────────────────┐
│ 로그인 상태 확인 (Server Action)   │
└─────────────────────────────┘
    ↓
┌──────────┬──────────┐
│ 로그인됨  │ 비로그인  │
└─────┬────┴─────┬────┘
      ↓          ↓
결제 페이지  로그인 페이지
      ↓
토스페이먼츠 결제위젯
      ↓
결제 완료
      ↓
┌──────────┬──────────┐
│ 성공     │ 실패     │
└─────┬────┴─────┬────┘
      ↓          ↓
성공 페이지  실패 페이지
```

---

## 2. 기능 상세

### 2.1 구매 시작 (Server Action)

**파일:** `src/actions/payment.ts`

#### `initPurchaseAction`
```typescript
export async function initPurchaseAction(programId: string) {
  // 1. 로그인 확인
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      requiresAuth: true,
      redirectUrl: `/signin?redirectTo=/programs/payment/${programId}`
    };
  }

  // 2. 프로그램 정보 조회
  const program = await getProgramWithWeeksBySlugQuery(programId);

  if (!program) {
    return { success: false, error: "프로그램을 찾을 수 없습니다" };
  }

  // 3. 결제 페이지 URL 반환
  return {
    success: true,
    program: {
      id: program.id,
      title: program.title,
      price: program.price,
      type: program.type,
    }
  };
}
```

### 2.2 결제 페이지

**파일:** `src/app/(commerce)/programs/payment/[programId]/page.tsx`

```typescript
const PaymentPage = async ({ params }: { params: Promise<{ programId: string }> }) => {
  const { programId } = await params;

  // 로그인 & 프로그램 확인
  const result = await initPurchaseAction(programId);

  if (!result.success && result.requiresAuth) {
    redirect(result.redirectUrl);
  }

  const { program } = result;

  return <PaymentClient program={program} programId={programId} />;
};
```

### 2.3 결제위젯 연동 (클라이언트 컴포넌트)

**파일:** `src/components/payment/tosspayments-widget.tsx`

```typescript
"use client";

import { loadPaymentWidget, ANONYMOUS } from "@tosspayments/payment-widget-sdk";
import { useEffect } from "react";

interface TossPaymentsWidgetProps {
  programId: string;
  amount: number;
  programName: string;
  customerName: string;
  customerEmail: string;
  onSuccess: (paymentKey: string) => void;
  onFail: (error: any) => void;
}

export function TossPaymentsWidget({
  programId,
  amount,
  programName,
  customerName,
  customerEmail,
  onSuccess,
  onFail,
}: TossPaymentsWidgetProps) {
  useEffect(() => {
    const paymentWidget = loadPaymentWidget("customer-key", ANONYMOUS);

    // 결제위젯 렌더링
    paymentWidget.renderPaymentMethods(
      "#payment-widget",
      { value: amount },
      { key: "TODO: 결제 UI의 variantKey" }
    );

    // 결제 버튼 렌더링
    paymentWidget.renderPaymentButtons(
      "#payment-button",
      { value: amount },
      { key: "TODO: 결제 UI의 variantKey" }
    );

    // 결제 완료 핸들러
    paymentWidget.on("success", async (data: any) => {
      onSuccess(data.paymentKey);
    });

    paymentWidget.on("fail", (error: any) => {
      onFail(error);
    });
  }, [amount, customerEmail, customerName, onSuccess, onFail, programName, programId]);

  return (
    <div>
      <div id="payment-widget" />
      <div id="payment-button" />
    </div>
  );
}
```

### 2.4 결제 완료 처리 (Server Action)

#### `createPaymentAction`
```typescript
export async function createPaymentAction({
  programId,
  paymentKey,
}: {
  programId: string;
  paymentKey: string;
}) {
  const userId = await getUserId();

  if (!userId) {
    return { success: false, error: "인증되지 않은 사용자입니다" };
  }

  // 1. 주문 생성
  const orderId = await createOrderQuery({
    userId,
    programId,
    paymentKey,
    amount: /* 프로그램 가격 */,
    status: "PENDING",
  });

  // 2. 결제 승인 (토스페이먼츠 API)
  const approvalResult = await approvePayment(paymentKey, orderId, amount);

  if (!approvalResult.success) {
    await updateOrderStatusQuery(orderId, "FAILED");
    return { success: false, error: "결제 승인 실패" };
  }

  // 3. 수강생 등록
  await createEnrollmentQuery({
    userId,
    programId,
    orderId,
    status: "ACTIVE",
  });

  // 4. 주문 상태 업데이트
  await updateOrderStatusQuery(orderId, "COMPLETED");

  revalidatePath(`/programs/payment/${programId}`);

  return {
    success: true,
    orderId,
    redirectUrl: `/programs/success?orderId=${orderId}`
  };
}
```

---

## 3. 페이지 구조

### 3.1 URL 구조

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 프로그램 상세 | `/programs/[slug]` | 상세 정보, 구매하기 버튼 |
| 결제 페이지 | `/programs/payment/[programId]` | 결제위젯 렌더링 |
| 결제 성공 | `/programs/success` | 성공 메시지, 내역으로 이동 |
| 결제 실패 | `/programs/failed` | 실패 메시지, 재시도 버튼 |

### 3.2 결제 페이지 UI

```
┌─────────────────────────────────────────────┐
│  결제 정보                                   │
│  ┌─────────────────────────────────────┐   │
│  │ 프로그램: 2026 서울 하이록스 대비     │   │
│  │ 금액: 100,000원                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  결제 수단 선택 (결제위젯 영역)      │   │
│  │  [결제위젯이 렌더링되는 위치]        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │      [결제하기] 버튼                 │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 4. 데이터베이스 스키마

### 4.1 orders 테이블 (기존)

```typescript
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => account.id),
  programId: uuid("program_id").references(() => programs.id),
  paymentKey: text("payment_key"), // 토스페이먼츠 결제 키
  amount: numeric("amount", { precision: 12, scale: 0 }),
  status: text("status"), // PENDING, COMPLETED, FAILED, CANCELLED
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 4.2 enrollments 테이블 (기존)

```typescript
export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => account.id),
  programId: uuid("program_id").references(() => programs.id),
  orderId: uuid("order_id").references(() => orders.id),
  status: text("status"), // ACTIVE, EXPIRED, CANCELLED
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // accessPeriodDays 계산
});
```

---

## 5. 필요한 API

### 5.1 토스페이먼츠 SDK 설치

```bash
npm install @tosspayments/payment-widget-sdk
```

### 5.2 환경 변수

```env
# .env.local
TOSS_PAYMENTS_CLIENT_KEY=your_client_key
TOSS_PAYMENTS_SECRET_KEY=your_secret_key
TOSS_PAYMENTS_WIDGET_VARIANT_KEY=your_variant_key
```

---

## 6. 결제 흐름 상세

### 6.1 정상 흐름

1. **구매 시작**: 사용자가 프로그램 상세에서 [구매하기] 클릭
2. **로그인 확인**: Server Action이 로그인 상태 확인
   - 비로그인: `/signin?redirectTo=/programs/payment/{programId}`로 리다이렉트
   - 로그인됨: 결제 페이지로 이동
3. **결제위젯 렌더링**: 결제 수단 선택 UI 표시
4. **결제 진행**: [결제하기] 버튼 클릭 → 토스페이먼츠 결제창
5. **결제 완료**: `paymentKey` 수신
6. **주문 생성**: orders 테이블에 주문 저장
7. **결제 승인**: 토스페이먼츠 API로 결제 승인 요청
8. **수강생 등록**: enrollments 테이블에 등록
9. **성공 페이지**: `/programs/success?orderId={orderId}`로 이동

### 6.2 실패 흐름

- 결제 실패: `/programs/failed`로 이동
- 네트워크 오류: 재시도 유도

---

## 7. 파일 목록

### 생성할 파일

```
src/
├── actions/
│   └── payment.ts                  # 결제 관련 Server Actions
├── app/
│   └── (commerce)/
│       └── programs/
│           ├── payment/
│           │   └── [programId]/
│           │       └── page.tsx   # 결제 페이지
│           ├── success/
│           │   └── page.tsx      # 성공 페이지
│           └── failed/
│               └── page.tsx      # 실패 페이지
└── components/
    └── payment/
        └── tosspayments-widget.tsx  # 토스페이먼츠 위젯
```

### 수정할 파일

```
src/
├── app/(commerce)/programs/[slug]/
│   └── page.tsx                    # 구매하기 버튼 추가
├── db/queries/
│   └── order.ts                    # 주문 관련 쿼리 (기존 확인)
└── db/schema.ts                    # orders, enrollments 확인
```

---

## 8. 개발 우선순위

### Phase 1: 기본 구조
1. ✅ `initPurchaseAction` 구현
2. ✅ 결제 페이지 레이아웃
3. ✅ 성공/실패 페이지

### Phase 2: 토스페이먼츠 연동
1. ✅ SDK 설치
2. ✅ 결제위젯 컴포넌트 구현
3. ✅ `createPaymentAction` 구현
4. ✅ 결제 승인 API 연동

### Phase 3: 수강생 등록
1. ✅ `createEnrollmentQuery` 구현
2. ✅ 수강 기간 계산 로직
3. ✅ 기존 수강생 체크
4. ⏳ 결제 성공 시 order & enrollment 데이터 생성 구현

### Phase 4: 추가 기능
1. ⏳ 결제 성공 페이지 UI 개선 (앱 안내 문구 추가)
2. 결제 내역 페이지
3. 환불 처리
4. 결제 알림

---

## 9. 예외 처리

### 9.1 사용자 인증 실패
- 로그인 페이지로 리다이렉트
- 결제 페이지 URL을 쿼리 문자열로 전달

### 9.2 프로그램 조회 실패
- "프로그램을 찾을 수 없습니다" 메시지
- 프로그램 목록으로 리다이렉트

### 9.3 이미 구매한 프로그램
- "이미 구매한 프로그램입니다" 메시지
- 내 수강 프로그램으로 리다이렉트

### 9.4 결제 실패
- 실패 사유 표시
- 재시도 버튼 제공

---

## 10. 보안 고려사항

1. **결제 위변조**: Server Action에서만 주문 생성/결제 승인
2. **금액 검증**: 프로그램 가격과 결제 금액 일치 확인
3. **중복 결제 방지**: 이미 활성화된 수강권 확인
4. **결제키 검증**: 토스페이먼츠 서명 검증

---

## 11. 테스트 시나리오

### 시나리오 1: 신규 사용자 구매
```
1. 비로그인 사용자가 프로그램 상세 방문
2. [구매하기] 클릭 → 로그인 페이지로 이동
3. 로그인 완료 → 결제 페이지로 이동
4. 결제 완료 → 성공 페이지 → 수강 시작
```

### 시나리오 2: 기존 사용자 구매
```
1. 로그인된 사용자가 프로그램 상세 방문
2. [구매하기] 클릭 → 바로 결제 페이지로 이동
3. 결제 완료 → 성공 페이지
```

### 시나리오 3: 결제 실패
```
1. 사용자가 결제 진행
2. 잔액 부족 등으로 결제 실패
3. 실패 페이지 표시 → 재시도 가능
```

### 시나리오 4: 이미 구매한 프로그램
```
1. 이미 구매한 사용자가 [구매하기] 클릭
2. "이미 구매한 프로그램입니다" 메시지
3. 내 수강 프로그램으로 리다이렉트
```

---

## 12. 결제 성공 후 데이터 처리

### 12.1 결제 성공 페이지 개선

**파일:** `src/app/(commerce)/programs/success/page.tsx`

#### UI 개선 사항

```
┌─────────────────────────────────────────────┐
│  ✅ 결제가 완료되었습니다                      │
│                                             │
│  수강 프로그램이 등록되었습니다.               │
│                                             │
│  [주문 정보]                                 │
│  주문 번호: order-1234567890                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  💡 앱에서 바로 시작하세요!          │   │
│  │                                     │   │
│  │  앱을 다운로드하고 구매 내역을       │   │
│  │  확인한 후 프로그램을 시작하세요.    │   │
│  │                                     │   │
│  │  [앱 다운로드]  [내 수강 프로그램]   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### 추가할 텍스트 내용

```typescript
<Card className="bg-green-50 border-green-200">
  <CardContent className="p-4">
    <div className="flex gap-3">
      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
      <div className="text-sm text-green-800">
        <p className="font-medium mb-1">앱에서 바로 시작하세요!</p>
        <p className="text-green-700">
          앱을 다운로드하고 구매 내역을 확인한 후 프로그램을 시작하세요.
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

### 12.2 결제 성공 후 데이터 처리 흐름

```
토스페이먼츠 결제 성공
    ↓
successUrl로 리다이렉트
    ↓
┌─────────────────────────────────────────┐
│ 1. 쿼리 파라미터 추출                    │
│    - paymentKey, orderId, amount        │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 2. Server Action: processPaymentSuccess │
│    - 결제 승인 요청 (토스페이먼츠 API)   │
│    - 결제 정보 검증                      │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 3. orders 테이블에 주문 생성             │
│    - userId, programId, paymentKey     │
│    - amount, status: "COMPLETED"       │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 4. enrollments 테이블에 등록 생성       │
│    - userId, programId, orderId        │
│    - status: "ACTIVE"                  │
│    - enrolledAt, expiresAt 계산        │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 5. 캐시 무효화 및 리다이렉트            │
│    - revalidatePath                     │
│    - 내 수강 프로그램으로 이동          │
└─────────────────────────────────────────┘
```

### 12.3 Server Action: processPaymentSuccess

```typescript
// src/actions/payment.ts

export async function processPaymentSuccessAction(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증되지 않은 사용자입니다" };
  }

  // 1. 결제 승인 요청
  const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
  const approvalResponse = await fetch(
    `https://api.tosspayments.com/v1/payments/${params.paymentKey}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(secretKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: params.orderId,
        amount: params.amount,
      }),
    }
  );

  if (!approvalResponse.ok) {
    return { success: false, error: "결제 승인 실패" };
  }

  const paymentData = await approvalResponse.json();

  // 2. 프로그램 정보 조회 (orderId에서 programId 추출)
  const programId = extractProgramIdFromOrderId(params.orderId);
  const program = await getProgramByIdQuery(programId);

  // 3. 주문 생성
  const order = await createOrderQuery({
    userId: user.id,
    programId: programId,
    paymentKey: params.paymentKey,
    amount: params.amount,
    status: "COMPLETED",
  });

  // 4. 수강생 등록
  const enrolledAt = new Date();
  const expiresAt = program.accessPeriodDays
    ? new Date(enrolledAt.getTime() + program.accessPeriodDays * 24 * 60 * 60 * 1000)
    : null;

  await createEnrollmentQuery({
    userId: user.id,
    programId: programId,
    orderId: order.id,
    status: "ACTIVE",
    enrolledAt,
    expiresAt,
  });

  // 5. 캐시 무효화
  revalidatePath("/user/program");
  revalidatePath(`/programs/${program.slug}`);

  return {
    success: true,
    orderId: order.id,
    programId: programId,
    redirectUrl: "/user/program",
  };
}
```

### 12.4 파일 수정

**결제 성공 페이지:**

```typescript
// src/app/(commerce)/programs/success/page.tsx

const PaymentSuccessPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>;
}) => {
  const params = await searchParams;
  const { paymentKey, orderId, amount } = params;

  // 필수 파라미터 확인
  if (!paymentKey || !orderId || !amount) {
    redirect("/programs");
  }

  // 결제 성공 처리
  const result = await processPaymentSuccessAction({
    paymentKey,
    orderId,
    amount: Number(amount),
  });

  if (!result.success) {
    return <div>결제 처리 중 오류가 발생했습니다</div>;
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

          {/* 버튼 그룹 */}
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/user/program">
                <User className="h-4 w-4 mr-2" />
                내 수강 프로그램으로 이동
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/programs">
                <Home className="h-4 w-4 mr-2" />
                프로그램 둘러보기
              </Link>
            </Button>
          </div>

          {/* 앱 안내 문구 */}
          <Card className="bg-green-50 border-green-200 mt-6">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm text-green-800 text-left">
                  <p className="font-medium mb-1">앱에서 바로 시작하세요!</p>
                  <p className="text-green-700">
                    앱을 다운로드하고 구매 내역을 확인한 후 프로그램을 시작하세요.
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
```

---

## 13. 추후 확장 기능

1. **구독형 결제**: 매월 자동 결제
2. **프로모션**: 할인코드 기능
3. **결제 수단 추가**: 카카오 pay, 네이버 pay 등
4. **환불**: 결제 취소 및 환불 처리
5. **영수증**: 현금영수증 발급
