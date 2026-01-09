# 🚀 Next.js 개발 표준 가이드라인

## 1. 아키텍처: MVC 패턴 (Layered Architecture)

역할 분담을 명확히 하여 코드의 예측 가능성을 높입니다.

| 레이어         | 위치                        | 역할                                                  | 비고                                                    |
| -------------- | --------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| **View**       | `src/app`, `src/components` | UI 렌더링 및 사용자 이벤트 처리                       | Drizzle 타입을 직접 참조 금지 (별도 DTO/Interface 사용) |
| **Controller** | `src/actions`               | 비동기 로직, 캐시 갱신(`revalidatePath`), 에러 핸들링 | Server Action 활용                                      |
| **Model**      | `src/db/queries`            | 순수 DB CRUD 및 트랜잭션 처리                         | Drizzle ORM 사용                                        |

---

## 2. 데이터 관리 및 인증 (Model & Auth)

- **DB 쿼리 위치**: `src/db/queries/[model-name]/` 경로에 작성합니다.
- **트랜잭션**: 비즈니스 로직에 필요한 트랜잭션은 쿼리 레이어(Model)에서 처리합니다.
- **인증(Auth)**: Supabase SSR 패키지를 활용하며, Middleware를 통해 Role(`Admin`, `Coach`, `User`)에 따른 접근 제어를 수행합니다.
- **상수 관리**: 전역에서 쓰이는 값은 `src/lib/constants`에서 관리합니다.

---

## 3. 서버 액션(Action) 표준

모든 서버 액션은 엄격한 결과 객체를 반환하여 View에서 에러를 처리할 수 있게 합니다.

- **성공/실패 구조화**: `{ success: boolean, data?: T, error?: string }` 형태 권장.
- **후처리**: 데이터 변경 후 `revalidatePath` 또는 `revalidateTag`를 통해 서버 캐시를 갱신합니다.

---

## 4. 폼(Form) 개발 표준 (React Hook Form + Zod)

Shadcn UI의 Form 컴포넌트를 사용하여 일관된 UX를 제공합니다.

### ✅ 개발 체크리스트

1. **Schema**: 파일 상단에 `zod` 스키마 정의 (에러 메시지 필수).
2. **Type**: `z.infer`를 사용하여 입력 타입 추출.
3. **Default Values**: `useForm` 선언 시 초기값 반드시 설정.
4. **UI 위계**: `FormField > FormItem > FormLabel > FormControl > FormMessage` 순서 준수.

---

## 5. UI/UX 가이드라인

- **공용 컴포넌트**: `src/components/ui` (Shadcn UI)를 최우선으로 사용합니다.
- **비동기 피드백**:
- **Loading**: 실행 중에는 **Spinner**를 표시하여 상태 알림.
- **Result**: 결과는 **Sonner Toaster**를 사용 (성공-Green, 실패-Red 등 색상 구분).
- **다크모드**: 모든 UI는 다크모드 대응이 되어야 합니다 (`dark:` 클래스 활용 확인).

---

## 🛠️ 표준 Form 템플릿 코드 (Full Example)

```tsx
"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner"; // Sonner Toaster 사용

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react"; // Spinner 예시

// 1. Schema 정의
const profileSchema = z.object({
  username: z
    .string()
    .min(2, { message: "사용자 이름은 최소 2글자 이상이어야 합니다." }),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [isPending, startTransition] = useTransition();

  // 2. Form 초기화
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "" },
  });

  // 3. Submit 핸들러 (Server Action 연동)
  const onSubmit = (values: ProfileValues) => {
    startTransition(async () => {
      // const result = await updateProfileAction(values);
      // 예시 로직:
      const success = true;

      if (success) {
        toast.success("프로필이 업데이트되었습니다.", {
          style: { backgroundColor: "#10b981", color: "#fff" },
        });
      } else {
        toast.error("업데이트에 실패했습니다.", {
          style: { backgroundColor: "#ef4444", color: "#fff" },
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>사용자 이름</FormLabel>
              <FormControl>
                <Input
                  placeholder="이름을 입력하세요"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>공용 닉네임으로 사용됩니다.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "저장하기"
          )}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 📂 디렉토리 구조 요약

- `(Auth)`: 로그인/회원가입 (서치 파라미터로 Coach/User 구분)
- `(Coach)`: `/dashboard`, `/coach/onboarding` (접근 제한)
- `(User)`: `/user/program/[slug]`, `/user/checkout` (일반 유저 전용)
- `src/db/queries`: 순수 DB 로직 (Model)
- `src/actions`: 비즈니스 로직 및 캐시 제어 (Controller)

---

이 가이드라인이 프로젝트의 일관성을 유지하는 데 도움이 되길 바랍니다. 추가로 특정 레이어(예: Drizzle 쿼리 작성법)에 대한 상세 템플릿이 필요하신가요?
