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
});

// 세션 스키마
export const sessionSchema = z.object({
  workoutId: z.string().min(1, "일차를 선택해주세요"),
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().optional(),
  orderIndex: z.number().default(0),
});
