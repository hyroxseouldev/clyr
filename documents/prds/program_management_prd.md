# CLYR 프로그램 관리 탭 PRD (Product Requirements Document)

## 1. 개요

### 1.1 목표

코치가 자신이 생성한 프로그램을 관리할 수 있는 대시보드 탭 기능 구현. 프로그램 상세 페이지(`/coach/dashboard/[pid]`)에서 워크아웃 커리큘럼 관리, 주문/수강권 관리, 프로그램 설정을 수행할 수 있도록 한다.

### 1.2 개발 원칙

- Server Actions 우선 활용
- React Hook Form + Zod로 폼 검증
- Shadcn UI 컴포넌트 활용
- 비동기 작업 시 로딩 상태 및 에러 처리 필수

## 2. 탭 구조

프로그램 상세 페이지는 4개의 탭으로 구성:

| 탭 이름     | 컴포넌트 파일          | 주요 기능                           |
| ----------- | ---------------------- | ----------------------------------- |
| 프로그램 정보 | `program-info-tab.tsx` | 프로그램 기본 정보 조회/수정 (기존)  |
| 워크 아웃   | `workout-tab.tsx`      | 주차/일차/세션 CRUD 관리            |
| 구매 목록   | `order-list-tab.tsx`   | 주문 조회 및 수강권 관리             |
| 설정        | `setting-tab.tsx`      | 프로그램 삭제                       |

## 3. 워크 아웃 탭 (Workout Tab)

### 3.1 기능 개요

프로그램의 커리큘럼을 3단계 계층 구조로 관리:
- **주차 (Week)**: 프로그램의 주차별 구분
- **일차 (Workout)**: 주차 내의 일차별 운동 루틴
- **세션 (Session)**: 일차 내의 개별 운동 세션

### 3.2 데이터 구조

```
Program
└── Week (주차)
    ├── weekNumber: 1, 2, 3...
    ├── title: "1주차: 적응 및 기초 체력"
    └── description: "주차별 가이드 설명"
    └── Workout (일차)
        ├── dayNumber: 1, 2, 3...
        ├── title: "하체/코어 집중"
        └── Session (세션)
            ├── orderIndex: 0, 1, 2...
            ├── title: "본운동: 백 스쿼트"
            └── content: "상세 운동 가이드 (위지윅 에디터)"
```

### 3.3 UI 구조

#### 3.3.1 주차 관리

**주차 목록 표시**
- 주차 번호(`weekNumber`) 순으로 정렬
- 각 주차 카드에 다음 정보 표시:
  - 주차 번호 및 제목
  - 설명 (있는 경우)
  - 해당 주차의 일차 개수
  - 수정/삭제 버튼

**주차 생성**
- "주차 추가" 버튼 클릭 시 다이얼로그 열기
- 입력 필드:
  - 주차 번호 (number, required)
  - 제목 (text, required)
  - 설명 (textarea, optional)
- 생성 성공 시 목록 자동 갱신

**주차 수정**
- 주차 카드의 "수정" 버튼 클릭 시 다이얼로그 열기
- 기존 값으로 폼 초기화
- 수정 가능 필드: 주차 번호, 제목, 설명

**주차 삭제**
- 주차 카드의 "삭제" 버튼 클릭 시 확인 다이얼로그 표시
- 삭제 시 하위 일차 및 세션도 함께 삭제 (CASCADE)
- 삭제 확인 후 목록 자동 갱신

#### 3.3.2 일차 관리

**일차 목록 표시**
- 주차 카드를 확장하면 해당 주차의 일차 목록 표시
- 일차 번호(`dayNumber`) 순으로 정렬
- 각 일차 카드에 다음 정보 표시:
  - 일차 번호 및 제목
  - 해당 일차의 세션 개수
  - 수정/삭제 버튼

**일차 생성**
- 주차 내 "일차 추가" 버튼 클릭 시 다이얼로그 열기
- 입력 필드:
  - 일차 번호 (number, required)
  - 제목 (text, required)
- 생성 성공 시 목록 자동 갱신

**일차 수정**
- 일차 카드의 "수정" 버튼 클릭 시 다이얼로그 열기
- 수정 가능 필드: 일차 번호, 제목

**일차 삭제**
- 일차 카드의 "삭제" 버튼 클릭 시 확인 다이얼로그 표시
- 삭제 시 하위 세션도 함께 삭제 (CASCADE)

#### 3.3.3 세션 관리

**세션 목록 표시**
- 일차 카드를 확장하면 해당 일차의 세션 목록 표시
- 세션 순서(`orderIndex`) 순으로 정렬
- 각 세션 카드에 다음 정보 표시:
  - 순서 번호 및 제목
  - 내용 미리보기 (있는 경우)
  - 수정/삭제 버튼
  - 순서 변경 버튼 (위/아래 화살표)

**세션 생성**
- 일차 내 "세션 추가" 버튼 클릭 시 다이얼로그 열기
- 입력 필드:
  - 제목 (text, required)
  - 내용 (textarea, optional) - 추후 위지윅 에디터로 확장 가능
  - 순서 (number, default: 0)
- 생성 성공 시 목록 자동 갱신

**세션 수정**
- 세션 카드의 "수정" 버튼 클릭 시 다이얼로그 열기
- 수정 가능 필드: 제목, 내용, 순서

**세션 삭제**
- 세션 카드의 "삭제" 버튼 클릭 시 확인 다이얼로그 표시

**세션 순서 변경**
- 세션 카드의 위/아래 화살표 버튼으로 순서 변경
- 순서 변경 시 즉시 저장 (배치 업데이트)

### 3.4 Server Actions

다음 액션들을 사용:

**주차 관련**
- `createWeekAction(programId, weekData)`
- `updateWeekAction(weekId, programId, updateData)`
- `deleteWeekAction(weekId, programId)`

**일차 관련**
- `createWorkoutAction(programId, workoutData)`
- `updateWorkoutAction(workoutId, programId, updateData)`
- `deleteWorkoutAction(workoutId, programId)`

**세션 관련**
- `createSessionAction(programId, sessionData)`
- `updateSessionAction(sessionId, programId, updateData)`
- `deleteSessionAction(sessionId, programId)`
- `reorderSessionsAction(programId, updates)`

**조회**
- `getFullProgramContentAction(programId)` - 전체 커리큘럼 조회

### 3.5 UX/UI 요구사항

- **로딩 상태**: 비동기 작업 시 Spinner 표시
- **성공 알림**: Sonner Toaster (초록색) - "주차가 생성되었습니다" 등
- **실패 알림**: Sonner Toaster (빨간색) - 에러 메시지 표시
- **확인 다이얼로그**: 삭제 작업 시 AlertDialog로 확인 요청
- **폼 검증**: Zod 스키마로 실시간 검증
- **반응형**: 모바일/태블릿/데스크톱 대응

## 4. 구매 목록 탭 (Order List Tab)

### 4.1 기능 개요

프로그램에 대한 주문 내역을 조회하고, 각 주문에 연결된 수강권을 관리할 수 있는 탭.

### 4.2 데이터 구조

```
Order (주문)
├── id, buyerId, programId, coachId
├── amount, status (PENDING/COMPLETED/CANCELLED)
├── paymentKey, createdAt
└── Enrollment (수강권)
    ├── id, userId, programId, orderId
    ├── status (ACTIVE/EXPIRED/PAUSED)
    ├── startDate, endDate
    └── createdAt
```

### 4.3 UI 구조

#### 4.3.1 주문 목록

**주문 목록 표시**
- 최신 주문 순으로 정렬
- 각 주문 카드에 다음 정보 표시:
  - 주문 번호 (ID 일부)
  - 구매자 정보 (이메일 또는 이름)
  - 주문 금액
  - 주문 상태 (배지로 표시)
    - PENDING: 노란색
    - COMPLETED: 초록색
    - CANCELLED: 회색
  - 주문 일시
  - 수강권 상태 (연결된 수강권이 있는 경우)

**주문 필터링**
- 상태별 필터 (전체/PENDING/COMPLETED/CANCELLED)
- 검색 기능 (구매자 이메일/이름으로 검색)

**주문 상세 보기**
- 주문 카드 클릭 시 상세 정보 표시
- 주문 정보:
  - 주문 ID
  - 구매자 정보
  - 프로그램 정보
  - 결제 금액
  - 결제 상태
  - 결제 키 (있는 경우)
  - 주문 일시

#### 4.3.2 수강권 관리

**수강권 목록**
- 주문 상세에서 연결된 수강권 목록 표시
- 각 수강권 카드에 다음 정보 표시:
  - 수강권 ID
  - 수강자 정보
  - 수강 상태 (배지로 표시)
    - ACTIVE: 초록색
    - EXPIRED: 회색
    - PAUSED: 노란색
  - 수강 시작일
  - 수강 만료일 (있는 경우)
  - 생성 일시

**수강권 상태 수정**
- 수강권 카드의 "상태 변경" 버튼 클릭
- 상태 선택 드롭다운:
  - ACTIVE (활성)
  - EXPIRED (만료)
  - PAUSED (정지)
- 상태 변경 시 확인 다이얼로그 표시
- 변경 성공 시 목록 자동 갱신

**수강권 조회**
- 프로그램의 모든 수강권 목록 조회 가능
- 필터링:
  - 상태별 필터 (전체/ACTIVE/EXPIRED/PAUSED)
  - 검색 기능 (수강자 이메일/이름으로 검색)

### 4.4 Server Actions

다음 액션들을 사용:

**주문 관련**
- `getOrdersByCoachIdQuery(coachId)` - 코치의 판매 주문 조회 (쿼리 직접 사용 또는 액션 추가 필요)
- `getOrderByIdQuery(orderId)` - 주문 상세 조회

**수강권 관련**
- `getEnrollmentsByProgramIdQuery(programId)` - 프로그램의 수강권 목록 조회
- `updateEnrollmentStatusAction(enrollmentId, status)` - 수강권 상태 변경
- `getEnrollmentByIdQuery(enrollmentId)` - 수강권 상세 조회

### 4.5 UX/UI 요구사항

- **로딩 상태**: 데이터 로딩 시 Skeleton 또는 Spinner 표시
- **빈 상태**: 주문이 없을 때 Empty 컴포넌트 표시
- **상태 배지**: 주문/수강권 상태를 색상으로 구분
- **성공 알림**: 상태 변경 성공 시 Sonner Toaster
- **확인 다이얼로그**: 상태 변경 시 확인 요청
- **페이지네이션**: 주문/수강권이 많을 경우 페이지네이션 또는 무한 스크롤

## 5. 설정 탭 (Setting Tab)

### 5.1 기능 개요

프로그램의 위험한 작업(삭제)을 수행할 수 있는 탭.

### 5.2 UI 구조

#### 5.2.1 프로그램 삭제

**삭제 섹션**
- 경고 메시지 표시:
  - "이 작업은 되돌릴 수 없습니다."
  - "프로그램을 삭제하면 모든 주차, 일차, 세션, 주문, 수강권 정보가 함께 삭제됩니다."
- "프로그램 삭제" 버튼 (빨간색, destructive variant)

**삭제 확인 프로세스**
1. "프로그램 삭제" 버튼 클릭
2. AlertDialog로 확인 요청:
   - 제목: "프로그램 삭제 확인"
   - 설명: 삭제 시 영향 받는 데이터 상세 설명
   - 확인 입력: 프로그램 제목을 정확히 입력해야 삭제 가능
   - 취소/삭제 버튼
3. 프로그램 제목 입력 확인 후 삭제 실행
4. 삭제 성공 시 대시보드 목록 페이지로 리다이렉트

#### 5.2.2 추가 설정 (향후 확장)

- 프로그램 공개/비공개 설정
- 프로그램 판매 중지/재개
- 프로그램 복제
- 프로그램 통계 보기

### 5.3 Server Actions

다음 액션을 사용:

**프로그램 삭제**
- `deleteProgramAction(programId)` - 프로그램 삭제

### 5.4 UX/UI 요구사항

- **경고 표시**: 삭제 섹션은 명확한 경고 스타일 적용
- **확인 다이얼로그**: AlertDialog로 이중 확인
- **입력 검증**: 프로그램 제목 정확히 입력해야 삭제 가능
- **로딩 상태**: 삭제 중 Spinner 표시
- **성공 알림**: 삭제 성공 시 Sonner Toaster
- **리다이렉트**: 삭제 성공 시 `/coach/dashboard`로 이동

## 6. 공통 요구사항

### 6.1 권한 확인

모든 탭에서 다음 권한 확인 필수:
- 현재 사용자가 프로그램의 소유자(코치)인지 확인
- 권한이 없으면 접근 거부 및 에러 메시지 표시

### 6.2 에러 처리

- 네트워크 오류
- 권한 오류
- 데이터 검증 오류
- 각각에 대한 명확한 에러 메시지 표시

### 6.3 성능 최적화

- 데이터 로딩 시 적절한 로딩 상태 표시
- 불필요한 리렌더링 방지 (React.memo, useMemo 활용)
- 대량 데이터의 경우 페이지네이션 또는 가상 스크롤 고려

### 6.4 접근성

- 키보드 네비게이션 지원
- 스크린 리더 지원 (aria-label 등)
- 색상 대비 준수

## 7. 구현 우선순위

### Phase 1: 워크 아웃 탭 (최우선)

1. 주차 CRUD 기능
2. 일차 CRUD 기능
3. 세션 CRUD 기능
4. 세션 순서 변경 기능

### Phase 2: 구매 목록 탭

1. 주문 목록 조회
2. 주문 상세 보기
3. 수강권 목록 조회
4. 수강권 상태 변경

### Phase 3: 설정 탭

1. 프로그램 삭제 기능
2. 삭제 확인 프로세스

## 8. 기술 스택

### 8.1 핵심 라이브러리

| 라이브러리        | 용도           | 설치 여부 |
| ----------------- | -------------- | --------- |
| `react-hook-form` | 폼 상태 관리    | ✅        |
| `@hookform/resolvers` | Zod 통합 | ✅        |
| `zod`             | 스키마 검증     | ✅        |
| `sonner`          | 알림 토스트     | ✅        |

### 8.2 UI 컴포넌트

- Shadcn UI 컴포넌트 활용:
  - Dialog (생성/수정 폼)
  - AlertDialog (삭제 확인)
  - Card (목록 아이템)
  - Badge (상태 표시)
  - Button (액션 버튼)
  - Form (폼 입력)
  - Input, Textarea (입력 필드)
  - Spinner (로딩)
  - Empty (빈 상태)
  - Accordion (주차/일차 확장)
  - Select (필터링)

## 9. 참고 문서

- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Sonner](https://sonner.emilkowal.ski/)

