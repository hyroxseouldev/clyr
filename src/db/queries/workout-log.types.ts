import type { Account, WorkoutLog, ProgramBlueprint, RoutineBlock, WorkoutLibrary } from "@/db/schema";

/**
 * 숙제 관리 페이지용 제출 타입
 */
export interface HomeworkSubmission {
  id: string;
  userId: string;
  logDate: Date;
  createdAt: Date;
  content: Record<string, unknown> | null;
  intensity: "LOW" | "MEDIUM" | "HIGH" | null;
  maxWeight: string;
  totalVolume: string;
  totalDuration: number | null;
  coachComment: string | null;
  isCheckedByCoach: boolean | null;

  // Relations - Account 타입 사용
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    avatarUrl: string | null;
    createdAt: Date;
  };
  library: WorkoutLibrary;
  blueprint: (ProgramBlueprint & {
    routineBlock: RoutineBlock | null;
  }) | null;
}

/**
 * 숙제 요약 통계 타입
 */
export interface HomeworkStats {
  totalSubmissions: number;
  pendingReviews: number;
  completedReviews: number;
}

/**
 * 숙제 관리 페이지 데이터 타입
 */
export interface HomeworkPageData {
  program: {
    id: string;
    title: string;
    totalWeeks?: number;
  };
  stats: HomeworkStats;
  availableDays: Array<{
    phaseNumber: number;
    dayNumber: number;
    label: string;
  }>;
}
