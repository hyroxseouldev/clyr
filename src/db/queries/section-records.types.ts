import type { Account, BlueprintSection, ProgramBlueprint } from "@/db/schema";

/**
 * ==========================================
 * HOMEWORK PAGE TYPES
 * ==========================================
 */

/**
 * Available phase/day combination for program
 */
export interface ProgramPhaseDay {
  phaseNumber: number;
  dayNumber: number;
}

/**
 * Statistics for homework page
 */
export interface HomeworkStats {
  totalSubmissions: number;
  pendingReviews: number;
  completedReviews: number;
}

/**
 * Initial page data for homework page
 */
export interface HomeworkPageData {
  program: {
    id: string;
    title: string;
  };
  availableDays: ProgramPhaseDay[];
  stats: HomeworkStats;
}

/**
 * Extended section record type for homework display
 */
export interface SectionRecordForHomework extends Omit<SectionRecordWithDetails, 'content'> {
  recordType: "TIME_BASED" | "WEIGHT_BASED" | "REP_BASED" |
             "DISTANCE_BASED" | "SURVEY" | "CHECKLIST" |
             "PHOTO" | "OTHER";
  isRecordable: boolean;
  content: Record<string, unknown> | null;
  userProfile?: {
    id: string;
    nickname: string | null;
  } | null;
}

/**
 * ==========================================
 * GROUPED HOMEWORK PAGE TYPES
 * ==========================================
 */

/**
 * Section record with blueprint info for grouped display
 */
export interface SectionRecordWithBlueprint extends Omit<SectionRecordWithDetails, 'content' | 'section'> {
  content: Record<string, unknown> | null;
  section: {
    id: string;
    title: string;
  };
  recordType: "TIME_BASED" | "WEIGHT_BASED" | "REP_BASED" | "DISTANCE_BASED" | "SURVEY" | "CHECKLIST" | "PHOTO" | "OTHER";
  isRecordable: boolean;
  blueprint: {
    id: string;
    phaseNumber: number;
    dayNumber: number;
  };
  userProfile?: {
    id: string;
    nickname: string | null;
  } | null;
}

/**
 * Records grouped by section within a blueprint
 */
export interface SectionGroup {
  section: {
    id: string;
    title: string;
  };
  records: SectionRecordWithBlueprint[];
}

/**
 * Records grouped by blueprint
 */
export interface BlueprintGroup {
  blueprint: {
    id: string;
    phaseNumber: number;
    dayNumber: number;
  };
  sections: SectionGroup[];
}

/**
 * Grouped homework page data
 */
export interface GroupedHomeworkPageData {
  program: {
    id: string;
    title: string;
  };
  blueprintGroups: BlueprintGroup[];
  stats: HomeworkStats;
}

/**
 * ==========================================
 * SECTION RECORD TYPES
 * ==========================================
 */

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
