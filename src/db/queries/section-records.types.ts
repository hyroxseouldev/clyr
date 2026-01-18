import type { Account, BlueprintSection, ProgramBlueprint } from "@/db/schema";

/**
 * 섹션 기록과 관련 데이터 포함
 */
export interface SectionRecordWithDetails {
  id: string;
  userId: string;
  sectionId: string;
  content: Record<string, unknown>;
  completedAt: Date;
  coachComment: string | null;
  createdAt: Date;
  updatedAt: Date;

  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    avatarUrl: string | null;
  };
  section: BlueprintSection;
  sectionItem: {
    id: string;
    orderIndex: number;
    blueprint: ProgramBlueprint;
  };
}

/**
 * 섹션 기록 제출 (리더보드용)
 */
export interface SectionRecordSubmission {
  id: string;
  userId: string;
  sectionId: string;
  content: Record<string, unknown>;
  completedAt: Date;
  coachComment: string | null;

  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  section: BlueprintSection;
  sectionItem: {
    id: string;
    orderIndex: number;
    blueprint: ProgramBlueprint;
  };
}
