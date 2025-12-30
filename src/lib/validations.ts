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
