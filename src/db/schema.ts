import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  numeric,
  unique,
} from "drizzle-orm/pg-core";
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from "drizzle-orm";

// =============================================================
// 1. IDENTITY & PROFILES (누가 사용하는가)
// =============================================================

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
  profileImageUrl: text("profile_image_url"),
  representativeImage: text("representative_image"), // 대표 이미지
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

// [UserProfile] 일반 사용자용 프로필 (앱 사용)
export const userProfile = pgTable("user_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .references(() => account.id, { onDelete: "cascade" })
    .unique()
    .notNull(),

  nickname: text("nickname"), // 사용자 별명
  bio: text("bio"), // 자기소개
  profileImageUrl: text("profile_image_url"), // 프로필 이미지 URL
  phoneNumber: text("phone_number"), // 연락처

  // 운동 관련 메타데이터
  fitnessGoals: jsonb("fitness_goals").default([]).$type<string[]>(), // 운동 목표 (예: ["체중감량", "근력증가"])
  fitnessLevel: text("fitness_level").$type<
    "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  >(), // 운동 수준

  // 온보딩 정보
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  onboardingData: jsonb("onboarding_data")
    .default({})
    .$type<{
      gender?: "MALE" | "FEMALE" | "OTHER";
      currentWorkoutType?: "HYROX" | "CROSSFIT" | "RUNNING" | "GYM" | "OTHER";
      workoutExperience?: string;
    }>(),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =============================================================
// 2. WORKOUT ASSETS (무엇을 운동하는가)
// =============================================================

export const workoutLibrary = pgTable("workout_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  coachId: uuid("coach_id").references(() => account.id),
  title: text("title").notNull(),
  category: text("category"), // 가슴, 등, 하체 등
  workoutType: text("workout_type").default("WEIGHT_REPS").notNull(), // WEIGHT, TIME, DISTANCE 등
  videoUrl: text("video_url"),
  description: text("description"),
  isSystem: boolean("is_system").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =============================================================
// 3. PROGRAM (어떻게 설계하는가)
// =============================================================

// [Programs] 운동 프로그램 (판매 상품 정보)
export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  coachId: uuid("coach_id")
    .references(() => account.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(), // 프로그램 제목
  slug: text("slug").unique().notNull(), // URL 경로로 사용될 슬러그
  type: text("type").notNull().$type<"SINGLE" | "SUBSCRIPTION">(), // 단건판매 vs 구독형
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
  startDate: timestamp("start_date"), // 프로그램 시작일
  endDate: timestamp("end_date"), // 프로그램 종료일
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // ==================== NEW FIELDS ====================
  mainImageList: jsonb("main_image_list").default([]).$type<string[]>(),
  programImage: text("program_image"),
  curriculum: jsonb("curriculum")
    .default([])
    .$type<{ title: string; description: string }[]>(),
});

export const programBlueprints = pgTable("program_blueprints", {
  id: uuid("id").primaryKey().defaultRandom(),
  programId: uuid("program_id")
    .references(() => programs.id, { onDelete: "cascade" })
    .notNull(),
  phaseNumber: integer("phase_number").notNull(),
  dayNumber: integer("day_number").notNull(),
  dayTitle: text("day_title"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// [blueprintSections] Sections for blueprint content (many-to-many relationship)
export const blueprintSections = pgTable("blueprint_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(), // HTML from TipTap editor
  // 섹션 기록 타입 (record 저장/정렬 방식)
  recordType: text("record_type")
    .notNull()
    .$type<
      | "TIME_BASED" // 시간 기록 (FOR_TIME, AMRAP 등)
      | "WEIGHT_BASED" // 무게 기록 (1RM, 3RM 등)
      | "REP_BASED" // 횟수 기록 (MAX_REPS 등)
      | "DISTANCE_BASED" // 거리 기록 (5K run, 2K row 등)
      | "SURVEY" // 설문/숙제 (텍스트 응답)
      | "CHECKLIST" // 체크리스트
      | "PHOTO" // 사진 업로드
      | "OTHER" // 기타
    >()
    .default("OTHER"),
  // 기록 가능 유무 (사용자가 제출할 수 있는지)
  isRecordable: boolean("is_recordable").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// [blueprintSectionItems] Join table linking sections to blueprints
export const blueprintSectionItems = pgTable("blueprint_section_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  blueprintId: uuid("blueprint_id")
    .references(() => programBlueprints.id, { onDelete: "cascade" })
    .notNull(),
  sectionId: uuid("section_id")
    .references(() => blueprintSections.id, { onDelete: "cascade" })
    .notNull(),
  orderIndex: integer("order_index").notNull(), // For ordering sections within a blueprint
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// [sectionRecords] 섹션 완료 기록 (숙제, 설문, 퀴즈 등)
export const sectionRecords = pgTable(
  "section_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => account.id, { onDelete: "cascade" })
      .notNull(),
    userProfileId: uuid("user_profile_id")
      .references(() => userProfile.id, { onDelete: "cascade" })
      .notNull(),
    sectionId: uuid("section_id")
      .references(() => blueprintSections.id, { onDelete: "cascade" })
      .notNull(),
    sectionItemId: uuid("section_item_id")
      .references(() => blueprintSectionItems.id, { onDelete: "cascade" })
      .notNull(), // 컨텍스트 저장 (프로그램/페이즈/일차 필터링용)
    content: jsonb("content").default({}).$type<Record<string, unknown>>(),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
    coachComment: text("coach_comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // sectionItemId별로 유니크 (같은 주차 재도전 시 업데이트)
    // sectionId는 유니크 없음 (1주차 vs 4주차 같은 섹션 비교 가능)
    uniqueConstraint: unique().on(table.userId, table.sectionItemId),
  })
);

// ==========================================
// 4. 상거래 및 수강 권한 (Commerce & Access)
// ==========================================

// [WorkoutLogs] 사용자 운동 기록 (User & Coach)
export const workoutLogs = pgTable("workout_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => account.id, { onDelete: "cascade" })
    .notNull(),
  libraryId: uuid("library_id")
    .references(() => workoutLibrary.id)
    .notNull(),
  blueprintId: uuid("blueprint_id").references(() => programBlueprints.id),
  logDate: timestamp("log_date").notNull(), // 운동 날짜
  content: jsonb("content").default({}).$type<Record<string, unknown>>(), // 운동 기록 상세 내용 (JSON)
  intensity: text("intensity").$type<"LOW" | "MEDIUM" | "HIGH">(), // 운동 강도
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // 리더보드 랭킹 산출용 요약 필드
  maxWeight: numeric("max_weight").default("0"),
  totalVolume: numeric("total_volume").default("0"), // AMRAP의 경우 총 횟수 저장 가능
  totalDuration: integer("total_duration"), // FOR_TIME 기록 (초 단위)

  coachComment: text("coach_comment"),
  isCheckedByCoach: boolean("is_checked_by_coach").default(false),
});

// [Orders] 결제 내역 (판매 영수증)
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id")
    .references(() => account.id)
    .notNull(),
  programId: uuid("program_id")
    .references(() => programs.id, { onDelete: "cascade" })
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  orderId: uuid("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),

  startDate: timestamp("start_date"), // 앱에서 지정 (null 가능)
  endDate: timestamp("end_date"), // 수강 만료일 (현재시간 + accessPeriodDays)
  status: text("status")
    .default("ACTIVE")
    .notNull()
    .$type<"ACTIVE" | "EXPIRED" | "PAUSED">(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// 5. 관계 정의 (Relations)
// ==========================================

export const accountRelations = relations(account, ({ one, many }) => ({
  coachProfile: one(coachProfile, {
    fields: [account.id],
    references: [coachProfile.accountId],
  }),
  userProfile: one(userProfile, {
    fields: [account.id],
    references: [userProfile.accountId],
  }),
  programs: many(programs),
  workoutLogs: many(workoutLogs),
  sectionRecords: many(sectionRecords),
  workoutLibrary: many(workoutLibrary),
  ordersAsBuyer: many(orders, { relationName: "buyer" }),
  ordersAsCoach: many(orders, { relationName: "coach" }),
}));

export const coachProfileRelations = relations(coachProfile, ({ one }) => ({
  account: one(account, {
    fields: [coachProfile.accountId],
    references: [account.id],
  }),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  account: one(account, {
    fields: [userProfile.accountId],
    references: [account.id],
  }),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  coach: one(account, { fields: [programs.coachId], references: [account.id] }),
  enrollments: many(enrollments),
  blueprints: many(programBlueprints),
  orders: many(orders),
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
  order: one(orders, {
    fields: [enrollments.orderId],
    references: [orders.id],
  }),
}));

// workoutLibrary 관계
export const workoutLibraryRelations = relations(
  workoutLibrary,
  ({ one, many }) => ({
    coach: one(account, {
      fields: [workoutLibrary.coachId],
      references: [account.id],
    }),
    workoutLogs: many(workoutLogs),
  })
);

// blueprintSections 관계
export const blueprintSectionsRelations = relations(
  blueprintSections,
  ({ many }) => ({
    blueprints: many(blueprintSectionItems),
    sectionRecords: many(sectionRecords),
  })
);

// blueprintSectionItems 관계 (join table)
export const blueprintSectionItemsRelations = relations(
  blueprintSectionItems,
  ({ one, many }) => ({
    blueprint: one(programBlueprints, {
      fields: [blueprintSectionItems.blueprintId],
      references: [programBlueprints.id],
    }),
    section: one(blueprintSections, {
      fields: [blueprintSectionItems.sectionId],
      references: [blueprintSections.id],
    }),
    sectionRecords: many(sectionRecords),
  })
);

// programBlueprints 관계
export const programBlueprintsRelations = relations(
  programBlueprints,
  ({ one, many }) => ({
    program: one(programs, {
      fields: [programBlueprints.programId],
      references: [programs.id],
    }),
    sections: many(blueprintSectionItems), // many-to-many via join table
    workoutLogs: many(workoutLogs),
  })
);

// orders 관계
export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(account, {
    fields: [orders.buyerId],
    references: [account.id],
    relationName: "buyer",
  }),
  coach: one(account, {
    fields: [orders.coachId],
    references: [account.id],
    relationName: "coach",
  }),
  program: one(programs, {
    fields: [orders.programId],
    references: [programs.id],
  }),
  enrollments: many(enrollments),
}));

export const workoutLogsRelations = relations(workoutLogs, ({ one }) => ({
  user: one(account, {
    fields: [workoutLogs.userId],
    references: [account.id],
  }),
  library: one(workoutLibrary, {
    fields: [workoutLogs.libraryId],
    references: [workoutLibrary.id],
  }),
  blueprint: one(programBlueprints, {
    fields: [workoutLogs.blueprintId],
    references: [programBlueprints.id],
  }),
}));

// sectionRecords 관계
export const sectionRecordsRelations = relations(sectionRecords, ({ one }) => ({
  user: one(account, {
    fields: [sectionRecords.userId],
    references: [account.id],
  }),
  userProfile: one(userProfile, {
    fields: [sectionRecords.userProfileId],
    references: [userProfile.id],
  }),
  section: one(blueprintSections, {
    fields: [sectionRecords.sectionId],
    references: [blueprintSections.id],
  }),
  sectionItem: one(blueprintSectionItems, {
    fields: [sectionRecords.sectionItemId],
    references: [blueprintSectionItems.id],
  }),
}));

// ==========================================
// 6. Type Exports (타입 추출)
// ==========================================

// 조회용 타입
export type Account = InferSelectModel<typeof account>;
export type CoachProfile = InferSelectModel<typeof coachProfile>;
export type UserProfile = InferSelectModel<typeof userProfile>;
export type WorkoutLibrary = InferSelectModel<typeof workoutLibrary>;
export type BlueprintSection = InferSelectModel<typeof blueprintSections>;
export type BlueprintSectionItem = InferSelectModel<
  typeof blueprintSectionItems
>;
export type SectionRecord = InferSelectModel<typeof sectionRecords>;
export type Program = InferSelectModel<typeof programs>;
export type ProgramBlueprint = InferSelectModel<typeof programBlueprints>;
export type WorkoutLog = InferSelectModel<typeof workoutLogs>;
export type Order = InferSelectModel<typeof orders>;
export type Enrollment = InferSelectModel<typeof enrollments>;

// 생성/수정용 타입
export type NewAccount = InferInsertModel<typeof account>;
export type NewCoachProfile = InferInsertModel<typeof coachProfile>;
export type NewUserProfile = InferInsertModel<typeof userProfile>;
export type NewWorkoutLibrary = InferInsertModel<typeof workoutLibrary>;
export type NewBlueprintSection = InferInsertModel<typeof blueprintSections>;
export type NewBlueprintSectionItem = InferInsertModel<
  typeof blueprintSectionItems
>;
export type NewSectionRecord = InferInsertModel<typeof sectionRecords>;
export type NewProgram = InferInsertModel<typeof programs>;
export type NewProgramBlueprint = InferInsertModel<typeof programBlueprints>;
export type NewWorkoutLog = InferInsertModel<typeof workoutLogs>;
export type NewOrder = InferInsertModel<typeof orders>;
export type NewEnrollment = InferInsertModel<typeof enrollments>;
