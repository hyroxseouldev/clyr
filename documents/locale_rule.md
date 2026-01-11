## 🌐 next-intl 도입 및 운영 가이드라인

### 1. 폴더 구조 및 네이밍 규칙

프로젝트의 복잡도를 낮추기 위해 표준화된 구조를 사용합니다.

- **메시지 파일:** `messages/` 폴더 내에 JSON 형식으로 저장합니다. (예: `ko.json`, `en.json`)
- **컴포넌트 구조:** App Router를 사용할 경우 `[locale]` 세그먼트 아래에 페이지를 배치합니다.
- **네이밍 관례:** JSON 키값은 **camelCase**를 권장하며, 계층 구조를 활용해 의미를 명확히 합니다.

```json
// messages/ko.json
{
  "HomePage": {
    "title": "환영합니다!",
    "description": "Next.js 다국어 사이트입니다."
  }
}
```

### 2. 컴포넌트 사용 가이드

상황에 맞는 Hook과 함수를 사용하여 성능과 가독성을 챙깁니다.

- **Client Components:** `useTranslations` Hook을 사용합니다.
- **Server Components:** `getTranslations` (async) 함수를 사용하여 서버 사이드에서 메시지를 불러옵니다.
- **공통 주의사항:** \* 텍스트를 하드코딩하지 말고 반드시 `t('key')` 형식을 사용하세요.
- 복잡한 문장은 **Interpolation**(변수 삽입) 기능을 활용하세요. `t('welcome', { name: 'User' })`

### 3. 라우팅 및 미들웨어 설정

사용자의 언어 설정을 감지하고 적절한 경로로 리다이렉트하는 규칙입니다.

- **Locale 감지:** 브라우저 언어 설정을 우선하되, 쿠키나 URL 세그먼트(`.../en/...`)를 통해 수동 변경을 지원합니다.
- **Middleware:** `next-intl/middleware`를 통해 유효하지 않은 locale 접근 시 기본 언어(defaultLocale)로 리다이렉트 처리합니다.

### 4. 개발 협업 규칙 (Best Practices)

팀원들과 공유해야 할 핵심 원칙입니다.

1. **키값 중복 방지:** 공통 문구(예: 확인, 취소, 에러 메시지)는 `Common.json` 등 별도 네임스페이스로 관리합니다.
2. **타입 안정성:** `next-intl`의 TypeScript 설정을 통해 메시지 키에 대한 자동 완성 및 타입 체크를 강제합니다.
3. **날짜 및 숫자 포맷팅:** 지역별로 다른 날짜/숫자 형식은 `useFormatter`를 사용하여 일관성 있게 출력합니다.

## 🛠 Enum 타입 다국어 처리 가이드라인

### 1. JSON 키와 Enum 값 일치시키기 (권장)

가장 깔끔한 방법은 Enum의 값을 번역 파일의 키(Key)로 사용하는 것입니다.

**Step 1. Enum 정의**

```typescript
export enum UserRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  USER = "USER",
}
```

**Step 2. 번역 파일(ko.json) 구성**

```json
{
  "Roles": {
    "ADMIN": "관리자",
    "EDITOR": "편집자",
    "USER": "일반 사용자"
  }
}
```

**Step 3. 컴포넌트에서 사용**

```tsx
const t = useTranslations("Roles");
const role = UserRole.ADMIN;

// Enum 값을 키로 바로 전달
return <p>{t(role)}</p>;
```

### 2. 동적 매핑 함수(Getter) 활용

Enum 값에 따라 추가적인 로직이나 스타일이 필요한 경우, 별도의 헬퍼 함수를 만들어 관리합니다.

```tsx
// helpers/getRoleLabel.ts
export const useRoleLabel = () => {
  const t = useTranslations("Roles");

  return (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return t("ADMIN");
      case UserRole.EDITOR:
        return t("EDITOR");
      default:
        return t("USER");
    }
  };
};
```

### 3. Select(드롭다운) 옵션 처리

Enum을 기반으로 선택 목록을 만들 때는 `Object.values`를 사용하여 루프를 돕니다.

```tsx
const t = useTranslations("Roles");

const options = Object.values(UserRole).map((value) => ({
  label: t(value), // 번역된 문구
  value: value, // 서버에 보낼 값
}));
```

---

## ⚠️ 주의사항 및 팁

- **Uppercase vs Lowercase:** Enum 값이 대문자(`ADMIN`)라면 JSON 키도 대문자로 맞추는 것이 실수를 방지합니다.
- **Fallback 처리:** Enum에 정의되지 않은 값이 들어올 경우를 대비해 `t.fallback`을 고려하거나 TypeScript의 엄격한 체크를 활용하세요.
- **Type Safe Keys:** `next-intl`의 글로벌 타입 설정을 하면 `t(role)`을 쓸 때 존재하지 않는 키일 경우 에러를 띄워주어 매우 안전합니다.

Server Action이나 토스트 메시지(Toast)에서 다국어 에러 처리를 할 때 가장 큰 도전 과제는 **"서버에는 다국어 라이브러리가 없거나, 클라이언트 Hook(`useTranslations`)을 직접 사용할 수 없다"**는 점입니다.

이를 깔끔하게 해결하기 위한 가이드라인입니다.

---

## 🚨 Toast & Server Action 에러 처리 가이드라인

### 1. Server Action: 에러 코드(Key) 반환 전략

서버에서는 번역된 문자열을 직접 반환하지 말고, **번역 파일의 키(Key)** 혹은 **에러 코드**를 반환해야 합니다.

- **Bad:** 서버에서 `return { error: "로그인에 실패했습니다." }` (언어 변경 대응 불가)
- **Good:** 서버에서 `return { error: "AUTH_FAILED" }` 또는 `return { error: "errors.loginFailed" }`

```typescript
// app/actions/login.ts
"use server";

export async function login(formData: FormData) {
  try {
    // 로그인 로직...
  } catch (e) {
    // 클라이언트가 해석할 수 있는 '키'만 전달
    return { error: "login_error" };
  }
}
```

### 2. Client Side: 토스트 출력 (Mapping)

서버에서 받은 키를 클라이언트의 `useTranslations`와 연결하여 토스트를 띄웁니다.

```tsx
"use client";

import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast"; // 또는 sonner 등

export function LoginForm() {
  const t = useTranslations("Errors");

  const handleSubmit = async (data) => {
    const result = await login(data);

    if (result?.error) {
      // 서버에서 받은 'login_error'를 t()에 전달
      toast.error(t(result.error));
    }
  };
}
```

### 3. 에러 메시지 구조화 (messages/ko.json)

에러 전용 네임스페이스를 만들어 관리하면 유지보수가 편합니다.

```json
{
  "Errors": {
    "login_error": "아이디 또는 비밀번호가 일치하지 않습니다.",
    "network_error": "서버와의 연결이 원활하지 않습니다.",
    "unknown": "알 수 없는 오류가 발생했습니다.",
    "VALIDATION": {
      "required": "{field}은(는) 필수 입력 항목입니다."
    }
  }
}
```

---

## 🛠 고급 기법: 전역 에러 핸들러와 매핑

모든 에러를 일일이 `t()`로 감싸기 번거롭다면, **에러 코드 매핑 객체**를 가이드라인에 포함하세요.

### 1) 에러 응답 표준화

서버 액션의 반환 타입을 통일합니다.
`{ success: boolean, errorCode?: string, params?: object }`

### 2) 헬퍼 함수 활용

```tsx
// 공통 에러 토스트 함수 예시
const notifyError = (errorCode: string, params = {}) => {
  toast.error(t(`Errors.${errorCode}`, params));
};
```

### 3) 유효성 검사(Zod) 연동

`zod`를 사용한다면 서버에서 발생한 유효성 에러 코드도 `next-intl` 키와 매칭시켜 한꺼번에 처리할 수 있습니다.

---

## 📌 가이드라인 요약 (팀 공유용)

1. **서버 액션**은 절대 번역된 텍스트를 리턴하지 않는다. (오직 **에러 키**만 반환)
2. **토스트 메시지**는 항상 `useTranslations`를 거쳐서 출력한다.
3. **에러 키**는 `Errors.json` 네임스페이스 안에 계층화하여 관리한다.
4. 예외 상황(네트워크 단절 등)을 대비해 `Errors.unknown` 같은 **Fallback 메시지**를 반드시 준비한다.
