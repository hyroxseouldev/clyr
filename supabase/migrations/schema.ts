import { pgTable, uuid, text, timestamp, foreignKey, integer, unique, numeric, jsonb, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const account = pgTable("account", {
	id: uuid().primaryKey().notNull(),
	email: text().notNull(),
	fullName: text("full_name"),
	role: text().default('USER').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	avatarUrl: text("avatar_url"),
});

export const enrollments = pgTable("enrollments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	programId: uuid("program_id").notNull(),
	orderId: uuid("order_id"),
	startDate: timestamp("start_date", { mode: 'string' }).defaultNow().notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	status: text().default('ACTIVE').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "enrollments_order_id_orders_id_fk"
		}),
	foreignKey({
			columns: [table.programId],
			foreignColumns: [programs.id],
			name: "enrollments_program_id_programs_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [account.id],
			name: "enrollments_user_id_account_id_fk"
		}).onDelete("cascade"),
]);

export const programWeeks = pgTable("program_weeks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	programId: uuid("program_id").notNull(),
	weekNumber: integer("week_number").notNull(),
	title: text().notNull(),
	description: text(),
}, (table) => [
	foreignKey({
			columns: [table.programId],
			foreignColumns: [programs.id],
			name: "program_weeks_program_id_programs_id_fk"
		}).onDelete("cascade"),
]);

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	buyerId: uuid("buyer_id").notNull(),
	programId: uuid("program_id").notNull(),
	coachId: uuid("coach_id").notNull(),
	amount: numeric().notNull(),
	status: text().default('PENDING').notNull(),
	paymentKey: text("payment_key"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.buyerId],
			foreignColumns: [account.id],
			name: "orders_buyer_id_account_id_fk"
		}),
	foreignKey({
			columns: [table.coachId],
			foreignColumns: [account.id],
			name: "orders_coach_id_account_id_fk"
		}),
	foreignKey({
			columns: [table.programId],
			foreignColumns: [programs.id],
			name: "orders_program_id_programs_id_fk"
		}),
	unique("orders_payment_key_unique").on(table.paymentKey),
]);

export const coachProfile = pgTable("coach_profile", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	accountId: uuid("account_id").notNull(),
	nickname: text(),
	introduction: text(),
	experience: text(),
	certifications: jsonb().default([]),
	contactNumber: text("contact_number"),
	snsLinks: jsonb("sns_links").default({}),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [account.id],
			name: "coach_profile_account_id_account_id_fk"
		}).onDelete("cascade"),
	unique("coach_profile_account_id_unique").on(table.accountId),
]);

export const programs = pgTable("programs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	coachId: uuid("coach_id").notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	type: text().notNull(),
	thumbnailUrl: text("thumbnail_url"),
	shortDescription: text("short_description"),
	description: text(),
	isPublic: boolean("is_public").default(false).notNull(),
	isForSale: boolean("is_for_sale").default(false).notNull(),
	price: numeric({ precision: 12, scale:  0 }).default('0').notNull(),
	accessPeriodDays: integer("access_period_days"),
	difficulty: text().notNull(),
	durationWeeks: integer("duration_weeks").notNull(),
	daysPerWeek: integer("days_per_week").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.coachId],
			foreignColumns: [account.id],
			name: "programs_coach_id_account_id_fk"
		}).onDelete("cascade"),
	unique("programs_slug_unique").on(table.slug),
]);

export const workouts = pgTable("workouts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	programId: uuid("program_id").notNull(),
	weekId: uuid("week_id").notNull(),
	dayNumber: integer("day_number").notNull(),
	title: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.programId],
			foreignColumns: [programs.id],
			name: "workouts_program_id_programs_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.weekId],
			foreignColumns: [programWeeks.id],
			name: "workouts_week_id_program_weeks_id_fk"
		}).onDelete("cascade"),
]);

export const workoutSessions = pgTable("workout_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	workoutId: uuid("workout_id").notNull(),
	title: text().notNull(),
	content: text(),
	orderIndex: integer("order_index").default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.workoutId],
			foreignColumns: [workouts.id],
			name: "workout_sessions_workout_id_workouts_id_fk"
		}).onDelete("cascade"),
]);
