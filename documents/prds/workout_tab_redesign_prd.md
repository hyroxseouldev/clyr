# 워크아웃 탭 리디자인 PRD

## 개요
코치 대시보드의 워크아웃 탭을 프로그램 빌더 스타일로 리디자인합니다. 현재의 중첩된 Collapsible UI를 직관적인 인터페이스로 개선하고, 데이터 페칭 방식과 수정 폼 버그를 수정합니다.

---

## 1. 현재 문제점

### 1.1 UI/UX 문제
- **2~3중 중첩된 Collapsible**: Week → Workout → Session 순으로 펼쳐야해서 불편
- **한눈에 전체 구조를 볼 수 없음**: 항상 열고 닫아야 함
- **모바일에서 특히 불편**: 좁은 화면에서 계속 펼치고 내려야 함

### 1.2 데이터 페칭 문제
- 클라이언트 컴포넌트에서 `useEffect`로 데이터 페칭
- 불필요한 로딩 상태 관리
- 초기 렌더링 지연

### 1.3 버그
- 수정 다이어로그에 기존 데이터가 표시되지 않음
- 폼이 초기화되지 않아서 빈 값으로 수정됨

---

## 2. 개선 방향

### 2.1 데이터 페칭 개선

**변경 전:**
```tsx
// page.tsx (Server Component)
const { data: program } = await getProgramByIdAction(pid);
return <WorkoutTab programId={pid} />;

// workout-tab.tsx (Client Component)
useEffect(() => {
  const fetchContent = async () => {
    const result = await getFullProgramContentAction(pid);
    setWeeks(result.data);
  };
  fetchContent();
}, [programId]);
```

**변경 후:**
```tsx
// page.tsx (Server Component)
const { data: program } = await getProgramByIdAction(pid);
const { data: workouts } = await getFullProgramContentAction(pid);

return <WorkoutTab initialData={workouts} programId={pid} />;

// workout-tab.tsx (Client Component)
const [weeks, setWeeks] = useState<Week[]>(initialData);
// 더 이상 useEffect로 페칭 불필요
```

### 2.2 UI/UX 리디자인

#### 옵션 A: 좌측 트리 + 우측 상세 (추천)

```
┌─────────────────────────────────────────────────────────┐
│  Week 1          Week 2          Week 3                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ Day 1      │  │ Day 1      │  │ Day 1      │       │
│  │ - Session 1│  │ - Session 1│  │ - Session 1│       │
│  │ - Session 2│  │ - Session 2│  │ - Session 2│       │
│  │ Day 2      │  │ Day 2      │  │ Day 2      │       │
│  │ - Session 1│  │ - Session 1│  │ - Session 1│       │
│  └────────────┘  └────────────┘  └────────────┘       │
│                                                         │
│  [+ Week 추가]                                           │
└─────────────────────────────────────────────────────────┘
```

**장점:**
- 모든 내용을 한눈에 확인 가능
- 드래그앤드롭으로 순서 변경 직관적
- 널리 사용되는 패턴 (Notion, ClickUp 등)

**구현:**
- Shadcn/ui `ResizablePanel` 또는 간단한 Grid
- 각 Week를 Card로 표시, 내부에 Workout/Session 나열

#### 옵션 B: 탭 + 테이블

```
┌─────────────────────────────────────────────────────────┐
│  [Week 1 ▼]  [Week 2]  [Week 3]                         │
├─────────────────────────────────────────────────────────┤
│  Day    │ Title         │ Sessions     │ Actions       │
│  ────────┼──────────────┼──────────────┼──────────────│
│  Day 1  │ 하체         │ 3개          │ [Edit][Del]  │
│  Day 2  │ 상체         │ 2개          │ [Edit][Del]  │
│  Day 3  │ 코어         │ 4개          │ [Edit][Del]  │
│  [+ Day 추가]                                          │
└─────────────────────────────────────────────────────────┘
```

**장점:**
- 컴팩트한 레이아웃
- 테이블 정렬로 정보 빠르게 파악

#### 옵션 C: 카드 스택 (현재 개선)

```
┌─────────────────────────────────────────────────────────┐
│  📅 Week 1: 적응 및 기초 체력                    [Edit][Del]│
│  ─────────────────────────────────────────────────────  │
│  Day 1: 하체/코어                          [Edit][Del]   │
│    • Session 1, Session 2, Session 3                    │
│  Day 2: 상체/풀업                          [Edit][Del]   │
│    • Session 1, Session 2                              │
│  [+ Day 추가]                                           │
├─────────────────────────────────────────────────────────┤
│  📅 Week 2: 본격 운동                       [Edit][Del]│
│  (편집을 위해 클릭하여 펼치기)                           │
└─────────────────────────────────────────────────────────┘
```

**장점:**
- 기존 구조 유지로 리스크 최소화
- Week만 접을 수 있어서 1단계 개선

---

## 3. 수정 폼 버그 수정

### 문제 원인
```tsx
const form = useForm<z.infer<typeof weekSchema>>({
  resolver: zodResolver(weekSchema),
  defaultValues: {
    weekNumber: week?.weekNumber || 1,
    title: week?.title || "",
    description: week?.description || "",
  },
});
```

`defaultValues`는 컴포넌트 마운트 시에만 설정되므로, `week` prop이 나중에 변경되어도 폼이 업데이트되지 않음.

### 해결 방법

#### 방법 1: useEffect로 reset (권장)
```tsx
useEffect(() => {
  if (week) {
    form.reset({
      weekNumber: week.weekNumber,
      title: week.title,
      description: week.description || "",
    });
  }
}, [week, form.reset]);
```

#### 방법 2: key로 Dialog 리마운트
```tsx
<Dialog key={week?.id || "new"} open={open} onOpenChange={onOpenChange}>
  {/* Dialog가 unmount 후 다시 mount되면서 defaultValues 재설정 */}
</Dialog>
```

---

## 4. 구현 계획

### Phase 1: 데이터 페칭 개선
1. ✅ `CoachDashboardPidPage`에서 `getFullProgramContentAction` 호출
2. ✅ `WorkoutTab`에 `initialData` prop 추가
3. ✅ `useEffect` 페칭 로직 제거

### Phase 2: 수정 폼 버그 수정
1. ✅ `WeekFormDialog`에 `useEffect`로 `form.reset` 추가
2. ✅ `WorkoutFormDialog`에 `useEffect`로 `form.reset` 추가
3. ✅ `SessionFormDialog`에 `useEffect`로 `form.reset` 추가

### Phase 3: UI 리디자인 (옵션 A 선택)

#### 파일 구조
```
src/app/(coach)/coach/dashboard/[pid]/_components/
├── workout-tab.tsx           # 메인 컴포넌트 (개선)
├── week-builder-card.tsx     # Week 카드 (신규)
├── workout-list.tsx          # Workout 목록 (신규)
├── session-chip.tsx          # Session 칩 (신규)
├── week-form-dialog.tsx      # Week 생성/수정 (개선)
├── workout-form-dialog.tsx   # Workout 생성/수정 (개선)
└── session-form-dialog.tsx   # Session 생성/수정 (개선)
```

#### WeekBuilderCard 컴포넌트
```tsx
interface WeekBuilderCardProps {
  week: Week;
  onEdit: (week: Week) => void;
  onDelete: (week: Week) => void;
  onCreateWorkout: (weekId: string) => void;
  onEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workout: Workout) => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
}

// UI 구조
<Card>
  <CardHeader>
    <div className="flex justify-between items-center">
      <div>
        <Badge>{week.weekNumber}주차</Badge>
        <CardTitle>{week.title}</CardTitle>
        <CardDescription>{week.description}</CardDescription>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </CardHeader>

  <CardContent>
    {/* Workouts - 항상 펼쳐진 상태 */}
    <div className="space-y-2">
      {week.workouts.map((workout) => (
        <WorkoutListItem key={workout.id} workout={workout} />
      ))}
      <Button variant="outline" className="w-full" onClick={onCreateWorkout}>
        <Plus className="mr-2 h-4 w-4" />
        일차 추가
      </Button>
    </div>
  </CardContent>
</Card>
```

#### WorkoutListItem 컴포넌트
```tsx
interface WorkoutListItemProps {
  workout: Workout;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
}

// UI 구조
<div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50 hover:bg-muted transition-colors">
  <div className="flex-1">
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="text-xs">
        {workout.dayNumber}일차
      </Badge>
      <span className="font-medium">{workout.title}</span>
    </div>
    <div className="flex flex-wrap gap-1 mt-1">
      {workout.sessions.map((session) => (
        <SessionChip
          key={session.id}
          session={session}
          onEdit={onEditSession}
          onDelete={onDeleteSession}
        />
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={() => /* session 추가 */}
      >
        + 세션
      </Button>
    </div>
  </div>
  <div className="flex gap-1">
    <Button variant="ghost" size="icon" onClick={() => onEdit(workout)}>
      <Pencil className="h-3 w-3" />
    </Button>
    <Button variant="ghost" size="icon" onClick={() => onDelete(workout)}>
      <Trash className="h-3 w-3 text-destructive" />
    </Button>
  </div>
</div>
```

#### SessionChip 컴포넌트
```tsx
interface SessionChipProps {
  session: Session;
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
}

// UI 구조
<Badge variant="outline" className="group cursor-pointer hover:bg-accent">
  <span className="text-xs">{session.title}</span>
  <div className="hidden group-hover:flex items-center gap-1 ml-2">
    <Button
      variant="ghost"
      size="icon-sm"
      className="h-4 w-4 p-0"
      onClick={() => onEdit(session)}
    >
      <Pencil className="h-2.5 w-2.5" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      className="h-4 w-4 p-0"
      onClick={() => onDelete(session)}
    >
      <Trash className="h-2.5 w-2.5 text-destructive" />
    </Button>
  </div>
</Badge>
```

---

## 5. 데이터 변경 후 갱신

### Server Action 수정

```typescript
// actions/workout.ts
import { revalidatePath } from "next/cache";

export async function createWeekAction(programId: string, data: WeekInput) {
  // ... 생성 로직 ...

  // 생성 후 페이지 갱신
  revalidatePath(`/coach/dashboard/${programId}`);

  return { success: true, data: newWeek };
}

export async function updateWeekAction(weekId: string, programId: string, data: WeekInput) {
  // ... 수정 로직 ...

  revalidatePath(`/coach/dashboard/${programId}`);

  return { success: true, data: updatedWeek };
}
```

### 클라이언트에서 router.refresh() 사용

```tsx
// workout-tab.tsx
import { useRouter } from "next/navigation";

export default function WorkoutTab({ initialData, programId }: Props) {
  const router = useRouter();
  const [weeks, setWeeks] = useState(initialData);

  const handleWeekUpdate = async () => {
    const result = await updateWeekAction(/* ... */);
    if (result.success) {
      router.refresh(); // Server Component를 다시 렌더링
      toast.success("수정되었습니다.");
    }
  };
}
```

---

## 6. 우선순위

### P0 (필수)
1. ✅ 데이터 페칭 방식 변경 (Server Component → props)
2. ✅ 수정 폼 버그 수정 (useEffect로 form.reset)

### P1 (중요)
3. ✅ UI 리디자인 (옵션 A: 카드형 + 항상 펼쳐진 상태)
4. ✅ revalidatePath 추가

### P2 (개선)
5. 드래그앤드롭으로 순서 변경
6. Session 순서 변경 UI 개선
7. 빈 상태 UI 개선

---

## 7. 참고 화면

### 프로그램 빌더 레퍼런스
- **Notion Database**: 카드 뷰 + 인라인 편집
- **ClickUp**: 리스트 형태 task 관리
- **Asana**: 타임라인 뷰에서 day-by-day planning
- **TrainingPeaks**: 주차별 workout plan

### 핵심 패턴
1. **Scannability**: 한눈에 전체 구조 파악
2. **Direct Manipulation**: 클릭 횟수 최소화
3. **Context Preservation**: 편집 중 전체 맥락 유지
4. **Progressive Disclosure**: 필요시에만 상세 표시

---

## 8. 성공 지표

1. **사용자 경험**
   - Week/Workout/Session 편집까지의 클릭 수: 3회 이내
   - 전체 커리큘럼 파악 시간: 5초 이내

2. **기술적**
   - 초기 페이지 로딩: <500ms
   - 데이터 페칭: Server-side only
   - 수정 폼: 기존 데이터 100% 표시

3. **버그 해결**
   - 수정 폼에 데이터 표시: 100%
   - 수정 후 데이터 반영: 즉시
