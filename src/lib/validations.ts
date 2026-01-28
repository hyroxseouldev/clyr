import { z } from "zod";

// Validation 스키마 생성 함수 - 다국어 지원
export function createProgramSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().min(1, t('titleRequired')),
    slug: z.string().min(1, t('slugRequired')),
    type: z.enum(["SINGLE", "SUBSCRIPTION"]),
    price: z.string(),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    durationWeeks: z.number().min(1),
    daysPerWeek: z.number().min(1).max(7),
    accessPeriodDays: z.number().nullable(),
    isPublic: z.boolean().default(false),
    isForSale: z.boolean().default(false),
  });
}

// 주차 스키마
export function createWeekSchema(t: (key: string) => string) {
  return z.object({
    weekNumber: z.number().min(1, t('weekNumberRequired')),
    title: z.string().min(1, t('titleRequired')),
    description: z.string().optional(),
  });
}

// 일차 스키마
export function createWorkoutSchema(t: (key: string) => string) {
  return z.object({
    weekId: z.string().min(1, t('weekRequired')),
    dayNumber: z.number().min(1, t('dayNumberRequired')),
    title: z.string().min(1, t('titleRequired')),
    content: z.string().optional(), // HTML 형태의 일차 상세 정보
  });
}

// 세션 스키마
export function createSessionSchema(t: (key: string) => string) {
  return z.object({
    workoutId: z.string().min(1, t('workoutRequired')),
    title: z.string().min(1, t('titleRequired')),
    content: z.string().optional(),
    orderIndex: z.number().default(0),
  });
}

// 코치 프로필 스키마
export function createCoachProfileSchema(t: (key: string) => string) {
  return z.object({
    profileImageUrl: z.string().optional(),
    nickname: z.string().optional(),
    introduction: z
      .string()
      .max(200, t('introductionMax'))
      .optional(),
    experience: z.string().optional(),
    certifications: z.array(z.string()).optional().default([]),
    contactNumber: z.string().optional(),
    snsLinks: z
      .object({
        instagram: z.string().optional(),
        youtube: z.string().optional(),
        blog: z.string().optional(),
      })
      .optional()
      .default({}),
  });
}

// 회원가입 스키마
export function createSignUpSchema(t: (key: string) => string) {
  return z
    .object({
      email: z.string().email(t('email')),
      password: z
        .string()
        .min(8, t('passwordMin'))
        .max(100, t('passwordMax')),
      confirmPassword: z.string(),
      fullName: z
        .string()
        .min(2, t('nameMin'))
        .max(50, t('nameMax')),
      role: z.enum(["USER", "COACH"], {
        message: t('roleRequired'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordMismatch'),
      path: ["confirmPassword"],
    });
}

// 프로그램 블루프린트 스키마
export function createProgramBlueprintSchema(t: (key: string) => string) {
  return z.object({
    programId: z.string().min(1, t('programIdRequired')),
    phaseNumber: z.number().min(1, t('phaseNumberRequired')),
    dayNumber: z.number().min(1, t('dayNumberRequired')),
    dayTitle: z.string().optional(),
    routineBlockId: z.string().optional(),
    notes: z.string().optional(),
  });
}

// 페이즈 생성 스키마
export function createPhaseSchema(t: (key: string) => string) {
  return z.object({
    programId: z.string().min(1, t('programIdRequired')),
    phaseNumber: z.number().min(1, t('phaseNumberRequired')),
    dayCount: z.number().min(1, t('dayCountMin')),
  });
}

// 레거시시를 위한 기본 스키마 (다국어 미지원)
export const programSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  slug: z.string().min(1, "슬러그를 입력해주세요"),
  type: z.enum(["SINGLE", "SUBSCRIPTION"]),
  price: z.string(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  durationWeeks: z.number().min(1),
  daysPerWeek: z.number().min(1).max(7),
  accessPeriodDays: z.number().nullable(),
  isPublic: z.boolean().default(false),
  isForSale: z.boolean().default(false),
});

export const weekSchema = z.object({
  weekNumber: z.number().min(1, "주차 번호를 입력해주세요"),
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().optional(),
});

export const workoutSchema = z.object({
  weekId: z.string().min(1, "주차를 선택해주세요"),
  dayNumber: z.number().min(1, "일차 번호를 입력해주세요"),
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().optional(),
});

export const sessionSchema = z.object({
  workoutId: z.string().min(1, "일차를 선택해주세요"),
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().optional(),
  orderIndex: z.number().default(0),
});

export const coachProfileSchema = z.object({
  profileImageUrl: z.string().optional(),
  nickname: z.string().optional(),
  introduction: z
    .string()
    .max(200, "소개는 200자 이내로 입력해주세요")
    .optional(),
  experience: z.string().optional(),
  certifications: z.array(z.string()).optional().default([]),
  contactNumber: z.string().optional(),
  snsLinks: z
    .object({
      instagram: z.string().optional(),
      youtube: z.string().optional(),
      blog: z.string().optional(),
    })
    .optional()
    .default({}),
});

export type CoachProfileInput = z.infer<typeof coachProfileSchema>;

export const signUpSchema = z
  .object({
    email: z.string().email("올바른 이메일 형식을 입력해주세요"),
    password: z
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
      .max(100, "비밀번호는 최대 100자 이하여야 합니다"),
    confirmPassword: z.string(),
    fullName: z
      .string()
      .min(2, "이름은 최소 2자 이상이어야 합니다")
      .max(50, "이름은 최대 50자 이하여야 합니다"),
    role: z.enum(["USER", "COACH"], {
      message: "역할을 선택해주세요",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const programBlueprintSchema = z.object({
  programId: z.string().min(1, "프로그램 ID를 입력해주세요"),
  phaseNumber: z.number().min(1, "페이즈 번호를 입력해주세요"),
  dayNumber: z.number().min(1, "일차 번호를 입력해주세요"),
  dayTitle: z.string().optional(),
  routineBlockId: z.string().optional(),
  notes: z.string().optional(),
});

export type ProgramBlueprintInput = z.infer<typeof programBlueprintSchema>;

// 블루프린트 섹션 스키마
export function createBlueprintSectionSchema(t: (key: string) => string) {
  return z.object({
    blueprintId: z.string().min(1, t('blueprintIdRequired')),
    programId: z.string().min(1, t('programIdRequired')),
    title: z.string().min(1, t('sectionTitleRequired')),
    content: z.string().optional(),
    recordType: z.enum([
      "TIME_BASED",
      "WEIGHT_BASED",
      "REP_BASED",
      "DISTANCE_BASED",
      "SURVEY",
      "CHECKLIST",
      "PHOTO",
      "OTHER",
    ]).default("OTHER"),
    isRecordable: z.boolean().default(false),
  });
}

export const blueprintSectionSchema = z.object({
  blueprintId: z.string().min(1, "블루프린트 ID를 입력해주세요"),
  programId: z.string().min(1, "프로그램 ID를 입력해주세요"),
  title: z.string().min(1, "섹션 제목을 입력해주세요"),
  content: z.string().optional(),
  recordType: z.enum([
    "TIME_BASED",
    "WEIGHT_BASED",
    "REP_BASED",
    "DISTANCE_BASED",
    "SURVEY",
    "CHECKLIST",
    "PHOTO",
    "OTHER",
  ]).default("OTHER"),
  isRecordable: z.boolean().default(false),
});

export type BlueprintSectionInput = z.infer<typeof blueprintSectionSchema>;

export const phaseSchema = z.object({
  programId: z.string().min(1, "프로그램 ID를 입력해주세요"),
  phaseNumber: z.number().min(1, "페이즈 번호를 입력해주세요"),
  dayCount: z.number().min(1, "일일 최소 1일 이상이어야 합니다"),
});

export type PhaseInput = z.infer<typeof phaseSchema>;
