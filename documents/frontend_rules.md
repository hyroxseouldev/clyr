# 기본 가이드 라인

1. 최신 Nextjs 문서를 참고해서 개발합니다.
2. 함수 생성 시 Server Action 우선적으로 활용한다.
3. 비동기 함수 실행 시에는 Spinner 를 보여주고 , 결과 알림은 Sonner Toaster 로 유저에게 안내한다.
   3-1. 성공, 실패 알림에 따른 색상을 달리하여 시각적 효과를 준다.
4. UI 는 Shadncn 공용 Components 를 우선적으로 사용한다.
5. Form 데이터는 React Hook Form + Zod 로 명확한 타입 생성을 한다.
   6-1. Compoennt 또한 Shadcn UI Form 을 사용
6. DB Model 에 대한 CRUD 쿼리는 drizzle 쿼리를 사용하며 위치는 src/db/queries/modelName 이다.
7. Controller 에 해당하는 부분, Drizzle 쿼리는 순수하게 DB만 다룹니다. 트랜잭션도 이곳에서 다룹니다.
   7-1. 서버 액션 레이어 에서는 캐시 갱신등을 처리합니다.
8. 아키텍쳐는 MVC 를 지향합니다. Model(Drizzle, Query), View(Page, Components), Controller(Actions)
9. 인증 시스템은 Mvp 개발로 완성이 우선이기에 supabase 에서 제공하는 패키지을 적극 활용합니다
   - 참고 링크: https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=package-manager&package-manager=pnpm&queryGroups=framework&framework=nextjs
10. View 레이어 에서는 Drizzle의 생성 Type 을 직접적으로 쓰지 않습니다. 이유는 Schema(도메인 타입) 변경 시에 충돌 가능성이 생기기 때문입니다.

# 아키텍쳐 및 구조

- MVC 아키텍쳐에 기반합니다.
- Model(Domain): DB 에 관련된 것들을 모델 안에 포함합니다. Drizzle Orm 이 포함 됩니다.
- View: 뷰 영역입니다. 화면을 담당하는 것들입니다. src/app 안에 있는 페이지 컴포넌트들과 src/components 에 있는 것들이 포함됩니다.
- Controller: ServerAction, 비동기 함수들이 포함됩니다.

# App Routing

- 코치 유저와 회원 유저가 함께 사용할수 있기 때문에 그룹 라우팅으로 디렉토리를 관리 하고 Middleware 로 앱 사용시 유저 접근을 제한 합니다
- Role: 롤은 어드민, 코치, 일반 유저

```
/랜딩 페이지
/404

(Auth)

/signin
/signup
서치파라미터로 코치와 유저 구분
전체 접근 가능

(Coach)

코치 유저만 접근 가능
/dashboard 이하 모두
/coach/onboarding

(User)

/user/program/[slug]
/user/checkout/success
/user/checkout/failure
/user/signin
/user/signup
```

## Action 개발 표준 가이드 라인

- Action Result 사용으로 에러 처리를 엄격히 관리 한다.

## 📋 Form 개발 표준 가이드라인

1. **Schema 정의**: 파일 상단에 `zod`를 사용하여 입력값 검증 로직을 명확히 정의합니다.
2. **Type 추출**: `z.infer`를 사용하여 스키마로부터 타입을 자동으로 추출, 타입 안정성을 확보합니다.
3. **Form 초기화**: `useForm`에 `zodResolver`를 연결하고 `defaultValues`를 반드시 설정합니다.
4. **구조화된 UI**: `FormField`, `FormItem`, `FormLabel`, `FormControl` 순서의 위계 구조를 엄격히 따릅니다.

---

### 🛠️ 표준 Form 템플릿 코드

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

/** * 1. Schema 정의
 * 에러 메시지를 포함한 검증 로직을 한 곳에서 관리합니다.
 */
const formSchema = z.object({
  username: z.string().min(2, {
    message: "사용자 이름은 최소 2글자 이상이어야 합니다.",
  }),
});

/** 2. Type 정의 */
type FormValues = z.infer<typeof formSchema>;

export function ProfileForm() {
  /** 3. Form 초기화 */
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  /** 4. Submit 핸들러 (현재 비워둠) */
  const onSubmit = (values: FormValues) => {
    // TODO: 서버 액션 또는 API 호출 로직 구현
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Username 필드 */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>사용자 이름</FormLabel>
              <FormControl>
                <Input placeholder="이름을 입력하세요" {...field} />
              </FormControl>
              <FormDescription>
                서비스에서 사용하실 공용 닉네임입니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          저장하기
        </Button>
      </form>
    </Form>
  );
}
```
