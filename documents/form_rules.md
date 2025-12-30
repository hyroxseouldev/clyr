### 📋 Form 개발 표준 가이드라인

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
