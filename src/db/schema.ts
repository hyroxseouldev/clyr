import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from "drizzle-orm";

// ==========================================
// 1. 사용자 및 코치 프로필 (Identity)
// ==========================================

// [Account] 기본 계정 정보
export const account = pgTable("account", {
  id: uuid("id").primaryKey(), // Supabase Auth UID와 연결
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: text("role").default("USER").notNull(), // 'ADMIN', 'COACH', 'USER'
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// [CoachProfile] 코치 전용 상세 메타데이터 (1:1 관계)
export const coachProfile = pgTable("coach_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .references(() => account.id, { onDelete: "cascade" })
    .unique()
    .notNull(),

  nickname: text("nickname"), // 코치 별명
  introduction: text("introduction"), // 한줄 소개
  experience: text("experience"), // 코칭 경력 (상세 텍스트)
  // 자격증 리스트 (예: ["NASM-CPT", "생활스포츠지도사"])
  certifications: jsonb("certifications").default([]).$type<string[]>(),
  contactNumber: text("contact_number"), // 비즈니스 연락처
  // SNS 링크 (예: { instagram: "@id", youtube: "url" })
  snsLinks: jsonb("sns_links")
    .default({})
    .$type<{ instagram?: string; youtube?: string; blog?: string }>(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// 2. 프로그램 본체 (Product & Policy)
// ==========================================

// [Programs] 운동 프로그램 (판매 상품 정보)
export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  coachId: uuid("coach_id")
    .references(() => account.id, { onDelete: "cascade" })
    .notNull(),

  title: text("title").notNull(), // 프로그램 제목
  slug: text("slug").unique().notNull(), // URL 경로로 사용될 슬러그
  type: text("type").notNull().$type<"SINGLE" | "SUBSCRIPTION">(), // 단건판매 vs 구독형

  thumbnailUrl: text("thumbnail_url"),
  shortDescription: text("short_description"), // 리스트에 보여줄 요약
  description: text("description"), // 상세 페이지용 설명 (HTML/MD)

  // 가시성 및 판매 설정
  isPublic: boolean("is_public").default(false).notNull(), // 공개/비공개 설정
  isForSale: boolean("is_for_sale").default(false).notNull(), // 판매 중/판매 중지

  // 가격 및 수강 기간
  price: numeric("price", { precision: 12, scale: 0 }).default("0").notNull(),
  accessPeriodDays: integer("access_period_days"), // 수강 유효 기간 (일), null이면 평생소장

  // 프로그램 메타데이터
  difficulty: text("difficulty")
    .notNull()
    .$type<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">(),
  durationWeeks: integer("duration_weeks").notNull(), // 총 주차수
  daysPerWeek: integer("days_per_week").notNull(), // 주당 운동 일수

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// 3. 커리큘럼 계층 (Hierarchy: Week > Workout > Session)
// ==========================================

// [ProgramWeeks] 주차별 주제 (Section 단위)
export const programWeeks = pgTable("program_weeks", {
  id: uuid("id").primaryKey().defaultRandom(),
  programId: uuid("program_id")
    .references(() => programs.id, { onDelete: "cascade" })
    .notNull(),
  weekNumber: integer("week_number").notNull(), // 1주차, 2주차...
  title: text("title").notNull(), // 예: "1주차: 적응 및 기초 체력"
  description: text("description"), // 주차별 가이드 설명
});

// [Workouts] 날짜별 상세 루틴 (Day 단위)
export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  programId: uuid("program_id")
    .references(() => programs.id, { onDelete: "cascade" })
    .notNull(),
  weekId: uuid("week_id")
    .references(() => programWeeks.id, { onDelete: "cascade" })
    .notNull(),

  dayNumber: integer("day_number").notNull(), // 1일차, 2일차...
  title: text("title").notNull(), // 예: "하체/코어 집중"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// [WorkoutSessions] Day 안의 개별 세션 (Detail 단위)
export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutId: uuid("workout_id")
    .references(() => workouts.id, { onDelete: "cascade" })
    .notNull(),

  title: text("title").notNull(), // 예: "본운동: 백 스쿼트"
  content: text("content"), // 위지윅 에디터에서 온 상세 운동 가이드
  orderIndex: integer("order_index").default(0).notNull(), // 표시 순서
});

// ==========================================
// 4. 상거래 및 수강 권한 (Commerce & Access)
// ==========================================

// [Orders] 결제 내역 (판매 영수증)
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id")
    .references(() => account.id)
    .notNull(),
  programId: uuid("program_id")
    .references(() => programs.id)
    .notNull(),
  coachId: uuid("coach_id")
    .references(() => account.id)
    .notNull(), // 정산용

  amount: numeric("amount").notNull(),
  status: text("status")
    .default("PENDING")
    .notNull()
    .$type<"PENDING" | "COMPLETED" | "CANCELLED">(),
  paymentKey: text("payment_key").unique(), // 외부 결제사(Toss 등) 고유 키
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// [Enrollments] 실제 수강 권한 (권한 여부 판단의 핵심)
export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => account.id, { onDelete: "cascade" })
    .notNull(),
  programId: uuid("program_id")
    .references(() => programs.id, { onDelete: "cascade" })
    .notNull(),
  orderId: uuid("order_id").references(() => orders.id),

  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"), // 수강 만료일 (현재시간 + accessPeriodDays)
  status: text("status")
    .default("ACTIVE")
    .notNull()
    .$type<"ACTIVE" | "EXPIRED" | "PAUSED">(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 5. 관계 정의 (Relations)
// ==========================================

export const accountRelations = relations(account, ({ one, many }) => ({
  coachProfile: one(coachProfile, {
    fields: [account.id],
    references: [coachProfile.accountId],
  }),
  programs: many(programs),
}));

export const coachProfileRelations = relations(coachProfile, ({ one }) => ({
  account: one(account, {
    fields: [coachProfile.accountId],
    references: [account.id],
  }),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  coach: one(account, { fields: [programs.coachId], references: [account.id] }),
  weeks: many(programWeeks),
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(account, {
    fields: [enrollments.userId],
    references: [account.id],
  }),
  program: one(programs, {
    fields: [enrollments.programId],
    references: [programs.id],
  }),
}));

export const programWeeksRelations = relations(
  programWeeks,
  ({ one, many }) => ({
    program: one(programs, {
      fields: [programWeeks.programId],
      references: [programs.id],
    }),
    workouts: many(workouts),
  })
);

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  week: one(programWeeks, {
    fields: [workouts.weekId],
    references: [programWeeks.id],
  }),
  sessions: many(workoutSessions),
}));

export const workoutSessionsRelations = relations(
  workoutSessions,
  ({ one }) => ({
    workout: one(workouts, {
      fields: [workoutSessions.workoutId],
      references: [workouts.id],
    }),
  })
);

// ==========================================
// 6. Type Exports (타입 추출)
// ==========================================

// 조회용 타입
export type Account = InferSelectModel<typeof account>;
export type CoachProfile = InferSelectModel<typeof coachProfile>;
export type Program = InferSelectModel<typeof programs>;
export type ProgramWeek = InferSelectModel<typeof programWeeks>;
export type Workout = InferSelectModel<typeof workouts>;
export type WorkoutSession = InferSelectModel<typeof workoutSessions>;
export type Order = InferSelectModel<typeof orders>;
export type Enrollment = InferSelectModel<typeof enrollments>;

// 생성/수정용 타입
export type NewAccount = InferInsertModel<typeof account>;
export type NewCoachProfile = InferInsertModel<typeof coachProfile>;
export type NewProgram = InferInsertModel<typeof programs>;
export type NewProgramWeek = InferInsertModel<typeof programWeeks>;
export type NewWorkout = InferInsertModel<typeof workouts>;
export type NewWorkoutSession = InferInsertModel<typeof workoutSessions>;
export type NewOrder = InferInsertModel<typeof orders>;
export type NewEnrollment = InferInsertModel<typeof enrollments>;
