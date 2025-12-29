# CLYR 인증 시스템 PRD (Product Requirements Document)

## 1. 개요

### 1.1 목표

Supabase 인증 시스템을 활용하여 코치와 회원 유저가 각각의 역할에 맞게 접근할 수 있는 인증/인가 시스템 구축

### 1.2 개발 원칙

- MVP 개발 우선 → Supabase 패키지 적극 활용
- Server Actions 우선 활용
- 최신 Next.js 문서 기반 개발

## 2. 사용자 역할 (Roles)

| 역할          | 설명               | 접근 권한            |
| ------------- | ------------------ | -------------------- |
| **어드민**    | 시스템 관리자      | (추후 정의)          |
| **코치**      | 프로그램 생성/관리 | `/coach/*` 경로 접근 |
| **일반 유저** | 프로그램 구매/이용 | `/user/*` 경로 접근  |

## 3. 라우팅 구조

### 3.1 전체 접근 가능 (Public)

- `/` - 랜딩 페이지
- `/404` - 404 페이지

### 3.2 인증 그룹 (Auth)

```
/signin?role=coach
/signin?role=user
/signup?role=coach
/signup?role=user
```

- 전체 접근 가능
- 쿼리 파라미터로 코치/유저 구분

### 3.3 코치 그룹 (Coach) - 코치 전용

```
/coach/dashboard/*
/coach/onboarding
```

- Middleware로 코치 유저만 접근 제한

### 3.4 유저 그룹 (User) - 회원 전용

```
/user/program/[slug]
/user/checkout/success
/user/checkout/failure
```

- Middleware로 회원 유저만 접근 제한

## 4. 필수 기능 (Required Functions)

### 4.1 Server Actions로 구현할 기능들

| 기능                        | 설명                           |
| --------------------------- | ------------------------------ |
| **유저 정보 불러오기**      | 현재 로그인한 유저의 정보 조회 |
| **유저 이메일 가입 (코치)** | 코치 유저 이메일 회원가입      |
| **유저 이메일 가입 (회원)** | 일반 유저 이메일 회원가입      |
| **유저 이메일 로그인**      | 이메일/비밀번호 로그인         |
| **유저 정보 수정**          | 유저 프로필 정보 수정          |
| **유저 정보 삭제**          | 계정 삭제 기능                 |

### 4.2 공통 기능 (Supabase)

- Supabase 클라이언트 초기화 및 설정
- 인증 상태 관리
- 세션 관리

## 5. 파일 구조

```
src/
├── lib/
│   └── auth/
│       ├── client.ts          # Supabase 클라이언트 생성
│       ├── server.ts          # 서버 사이드 Supabase 클라이언트
│       └── actions.ts         # Server Actions (인증 관련)
├── components/
│   └── auth/
│       ├── signin-form.tsx    # 로그인 폼 (React Hook Form + Zod)
│       └── signup-form.tsx    # 회원가입 폼 (React Hook Form + Zod)
├── middleware.ts              # 라우트 접근 제어
└── app/
    ├── (public)/signin/page.tsx
    ├── (public)/signup/page.tsx
    ├── (coach)/*              # 코치 전용 라우트
    └── (user)/*               # 유저 전용 라우트
```

## 6. 기술 스택

### 6.1 핵심 라이브러리

| 라이브러리              | 용도                | 설치 여부 |
| ----------------------- | ------------------- | --------- |
| `@supabase/ssr`         | Supabase SSR 지원   | ✅        |
| `@supabase/supabase-js` | Supabase 클라이언트 | ✅        |
| `react-hook-form`       | 폼 상태 관리        | ✅        |
| `@hookform/resolvers`   | Zod 통합            | ✅        |
| `zod`                   | 스키마 검증         | ✅        |
| `sonner`                | 알림 토스트         | ✅        |

### 6.2 UI 라이브러리

- Shadcn UI 컴포넌트 활용 (Button, Input, Form, Card, Spinner 등)
- Tailwind CSS 스타일링

## 7. UX/UI 가이드라인

### 7.1 비동기 작업 처리

- **로딩**: Spinner 컴포넌트 표시
- **성공 알림**: Sonner Toaster (초록색)
- **실패 알림**: Sonner Toaster (빨간색)

### 7.2 폼 구현

- React Hook Form + Zod 스키마로 명확한 타입 정의
- Shadcn UI Form 컴포넌트 활용
- 실시간 검증 (validation error)

### 7.3 접근 제어

- Middleware에서 인증 상태 확인
- Role 기반 라우트 접근 제한
- 인증되지 않은 유저 → 로그인 페이지로 리다이렉트

## 8. 구현 우선순위

### Phase 1: 기본 인증 (최우선)

1. Supabase 클라이언트 설정 (client.ts, server.ts)
2. 로그인/회원가입 폼 UI 구현
3. Server Actions로 가입/로그인 로직 구현
4. Middleware로 기본 접근 제어

### Phase 2: 역할 기반 접근 제어

1. User Metadata에 Role 저장
2. 코치/유저 라우트 접근 제어 구현
3. 온보딩 페이지 연동

### Phase 3: 유저 정보 관리

1. 유저 정보 수정 기능
2. 유저 정보 삭제 기능
3. 프로필 페이지 구현

## 9. 참고 문서

- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=package-manager&package-manager=pnpm&queryGroups=framework&framework=nextjs)
