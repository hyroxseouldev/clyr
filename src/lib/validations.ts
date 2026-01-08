import { z } from "zod";

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

// 주차 스키마
export const weekSchema = z.object({
  weekNumber: z.number().min(1, "주차 번호를 입력해주세요"),
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().optional(),
});

// 일차 스키마
export const workoutSchema = z.object({
  weekId: z.string().min(1, "주차를 선택해주세요"),
  dayNumber: z.number().min(1, "일차 번호를 입력해주세요"),
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().optional(), // HTML 형태의 일차 상세 정보
});

// 세션 스키마
export const sessionSchema = z.object({
  workoutId: z.string().min(1, "일차를 선택해주세요"),
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().optional(),
  orderIndex: z.number().default(0),
});

// 코치 프로필 스키마
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

// 회원가입 스키마
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
