# CLYR 코치 프로필 페이지 PRD (Product Requirements Document)

## 1. 개요

### 1.1 목표

코치가 자신의 프로필 정보를 생성, 조회, 수정, 삭제할 수 있는 프로필 관리 페이지 구현. 코치의 전문성과 경력을 효과적으로 표현할 수 있도록 지원한다.

### 1.2 개발 원칙

- Server Actions 우선 활용
- React Hook Form + Zod로 폼 검증
- Shadcn UI 컴포넌트 활용
- 비동기 작업 시 로딩 상태 및 에러 처리 필수

## 2. 페이지 구조

### 2.1 라우트

- 경로: `/coach/profile`
- 접근 권한: 코치(COACH) 역할만 접근 가능
- Middleware로 자동 접근 제어

### 2.2 페이지 상태

1. **프로필 없음**: 프로필 생성 폼 표시
2. **프로필 있음**: 프로필 정보 표시 및 수정 폼 제공

## 3. 데이터 구조

### 3.1 CoachProfile 스키마

```typescript
{
  id: string;
  accountId: string; // 현재 로그인한 사용자 ID와 연결
  nickname?: string | null; // 코치 별명
  introduction?: string | null; // 한줄 소개
  experience?: string | null; // 코칭 경력 (상세 텍스트)
  certifications: string[]; // 자격증 리스트 (예: ["NASM-CPT", "생활스포츠지도사"])
  contactNumber?: string | null; // 비즈니스 연락처
  snsLinks: { // SNS 링크
    instagram?: string;
    youtube?: string;
    blog?: string;
  };
  updatedAt: Date;
}
```

## 4. UI 구조

### 4.1 페이지 레이아웃

```
┌─────────────────────────────────────┐
│  코치 프로필                          │
│  프로필 정보를 관리하세요              │
├─────────────────────────────────────┤
│                                     │
│  [프로필 정보 카드 또는 생성 폼]      │
│                                     │
│  [수정/삭제 버튼]                    │
│                                     │
└─────────────────────────────────────┘
```

### 4.2 프로필 없음 상태 (Empty State)

**표시 내용:**
- 아이콘 (UserIcon 또는 ProfileIcon)
- 안내 메시지: "프로필이 없습니다. 프로필을 생성해주세요."
- "프로필 생성" 버튼

**동작:**
- 버튼 클릭 시 프로필 생성 폼 다이얼로그 표시

### 4.3 프로필 있음 상태 (Profile View)

**프로필 정보 카드 표시:**

1. **기본 정보 섹션**
   - 닉네임 (nickname)
   - 한줄 소개 (introduction)
   - 연락처 (contactNumber)

2. **경력 및 자격증 섹션**
   - 코칭 경력 (experience) - 텍스트 영역
   - 자격증 목록 (certifications)
     - 각 자격증을 Badge로 표시
     - "자격증 추가" 버튼 (선택적)

3. **SNS 링크 섹션**
   - Instagram 링크 (있는 경우)
   - YouTube 링크 (있는 경우)
   - Blog 링크 (있는 경우)
   - 각 링크는 아이콘과 함께 표시

4. **액션 버튼**
   - "프로필 수정" 버튼
   - "프로필 삭제" 버튼 (destructive variant)

### 4.4 프로필 생성/수정 폼

**다이얼로그 형태로 표시**

**입력 필드:**

1. **닉네임** (nickname)
   - Input 컴포넌트
   - 선택 사항
   - Placeholder: "예: 김코치"

2. **한줄 소개** (introduction)
   - Textarea 컴포넌트
   - 선택 사항
   - Placeholder: "예: 10년 경력의 피트니스 전문가"
   - 최대 길이 제한 (선택적)

3. **코칭 경력** (experience)
   - Textarea 컴포넌트
   - 선택 사항
   - Placeholder: "상세한 코칭 경력을 입력해주세요"
   - 여러 줄 입력 가능

4. **자격증** (certifications)
   - 동적 리스트 입력
   - "자격증 추가" 버튼으로 항목 추가
   - 각 항목마다 삭제 버튼
   - Input 컴포넌트로 자격증명 입력

5. **연락처** (contactNumber)
   - Input 컴포넌트
   - 선택 사항
   - Placeholder: "예: 010-1234-5678"
   - 전화번호 형식 검증 (선택적)

6. **SNS 링크** (snsLinks)
   - Instagram 링크
     - Input 컴포넌트
     - Placeholder: "@username 또는 URL"
   - YouTube 링크
     - Input 컴포넌트
     - Placeholder: "YouTube 채널 URL"
   - Blog 링크
     - Input 컴포넌트
     - Placeholder: "블로그 URL"

**폼 액션:**
- "저장" 버튼 (생성/수정 모드에 따라 텍스트 변경)
- "취소" 버튼

### 4.5 프로필 삭제 확인

**AlertDialog로 표시:**
- 제목: "프로필 삭제 확인"
- 설명: "프로필을 삭제하면 모든 정보가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
- "취소" 버튼
- "삭제" 버튼 (destructive variant)

## 5. Server Actions

다음 액션들을 사용:

### 5.1 프로필 조회
- `getMyCoachProfileAction()` - 현재 로그인한 코치의 프로필 조회

### 5.2 프로필 생성
- `createCoachProfileAction(data)` - 프로필 생성
  - 중복 체크: 이미 프로필이 있으면 에러 반환

### 5.3 프로필 수정
- `updateCoachProfileAction(data)` - 프로필 수정
  - 존재 확인: 프로필이 없으면 에러 반환

### 5.4 프로필 삭제
- `deleteCoachProfileAction()` - 프로필 삭제
  - 존재 확인: 프로필이 없으면 에러 반환

## 6. UX/UI 요구사항

### 6.1 로딩 상태
- 데이터 로딩 중: Skeleton 또는 Spinner 표시
- 폼 제출 중: 버튼에 Spinner 표시 및 disabled 처리

### 6.2 성공/실패 알림
- **성공**: Sonner Toaster (초록색)
  - "프로필이 생성되었습니다."
  - "프로필이 수정되었습니다."
  - "프로필이 삭제되었습니다."
- **실패**: Sonner Toaster (빨간색)
  - 에러 메시지 표시

### 6.3 폼 검증
- Zod 스키마로 실시간 검증
- 필수 필드 표시 (있는 경우)
- 에러 메시지는 FormMessage 컴포넌트로 표시

### 6.4 반응형 디자인
- 모바일/태블릿/데스크톱 대응
- 다이얼로그는 모바일에서 전체 화면 또는 적절한 크기로 조정

### 6.5 접근성
- 키보드 네비게이션 지원
- 스크린 리더 지원 (aria-label 등)
- 색상 대비 준수

## 7. Validation Schema

### 7.1 CoachProfile Schema (Zod)

```typescript
const coachProfileSchema = z.object({
  nickname: z.string().optional().nullable(),
  introduction: z.string().max(200).optional().nullable(),
  experience: z.string().optional().nullable(),
  certifications: z.array(z.string()).default([]),
  contactNumber: z.string().optional().nullable(),
  snsLinks: z.object({
    instagram: z.string().optional(),
    youtube: z.string().url().optional().or(z.literal("")),
    blog: z.string().url().optional().or(z.literal("")),
  }).default({}),
});
```

## 8. 구현 세부사항

### 8.1 페이지 컴포넌트 구조

```typescript
// Server Component (데이터 페칭)
export default async function CoachProfilePage() {
  const profile = await getMyCoachProfileAction();
  
  return (
    <CoachProfileContent 
      initialProfile={profile.success ? profile.data : null} 
    />
  );
}

// Client Component (인터랙션)
function CoachProfileContent({ initialProfile }) {
  // 상태 관리 및 폼 처리
}
```

### 8.2 프로필 표시 컴포넌트

- `ProfileViewCard` - 프로필 정보 표시
- `ProfileFormDialog` - 프로필 생성/수정 폼
- `CertificationList` - 자격증 목록 관리
- `SnsLinksSection` - SNS 링크 표시

### 8.3 상태 관리

- `useState`로 프로필 데이터 관리
- `useTransition`으로 비동기 작업 처리
- 폼 상태는 `react-hook-form`으로 관리

## 9. 에러 처리

### 9.1 에러 시나리오

1. **인증 오류**
   - 메시지: "인증되지 않은 사용자입니다."
   - 동작: 로그인 페이지로 리다이렉트

2. **프로필 없음 (조회 시)**
   - 메시지: "프로필을 찾을 수 없습니다."
   - 동작: 프로필 생성 폼 표시

3. **중복 생성 시도**
   - 메시지: "이미 프로필이 존재합니다. 수정 기능을 사용해주세요."
   - 동작: 수정 모드로 전환

4. **수정/삭제 시 프로필 없음**
   - 메시지: "프로필이 존재하지 않습니다."
   - 동작: 프로필 생성 폼 표시

5. **네트워크 오류**
   - 메시지: "네트워크 오류가 발생했습니다. 다시 시도해주세요."
   - 동작: 재시도 가능

## 10. 구현 우선순위

### Phase 1: 기본 기능 (최우선)

1. 프로필 조회 기능
2. 프로필 생성 폼 및 기능
3. 프로필 수정 폼 및 기능
4. 기본 UI 구현

### Phase 2: 고급 기능

1. 자격증 동적 추가/삭제
2. SNS 링크 유효성 검증
3. 프로필 삭제 기능
4. 프로필 미리보기

### Phase 3: 개선 사항

1. 프로필 이미지 업로드 (추후 확장)
2. 프로필 공개/비공개 설정
3. 프로필 통계 (프로그램 수, 수강생 수 등)

## 11. 기술 스택

### 11.1 핵심 라이브러리

| 라이브러리        | 용도           | 설치 여부 |
| ----------------- | -------------- | --------- |
| `react-hook-form` | 폼 상태 관리    | ✅        |
| `@hookform/resolvers` | Zod 통합 | ✅        |
| `zod`             | 스키마 검증     | ✅        |
| `sonner`          | 알림 토스트     | ✅        |

### 11.2 UI 컴포넌트

- Shadcn UI 컴포넌트 활용:
  - Card (프로필 정보 표시)
  - Dialog (폼 다이얼로그)
  - AlertDialog (삭제 확인)
  - Form (폼 입력)
  - Input, Textarea (입력 필드)
  - Button (액션 버튼)
  - Badge (자격증 표시)
  - Spinner (로딩)
  - Empty (빈 상태)

## 12. 참고 문서

- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Sonner](https://sonner.emilkowal.ski/)

