import { relations } from "drizzle-orm/relations";
import { orders, enrollments, programs, account, programWeeks, coachProfile, workouts, workoutSessions } from "./schema";

export const enrollmentsRelations = relations(enrollments, ({one}) => ({
	order: one(orders, {
		fields: [enrollments.orderId],
		references: [orders.id]
	}),
	program: one(programs, {
		fields: [enrollments.programId],
		references: [programs.id]
	}),
	account: one(account, {
		fields: [enrollments.userId],
		references: [account.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	enrollments: many(enrollments),
	account_buyerId: one(account, {
		fields: [orders.buyerId],
		references: [account.id],
		relationName: "orders_buyerId_account_id"
	}),
	account_coachId: one(account, {
		fields: [orders.coachId],
		references: [account.id],
		relationName: "orders_coachId_account_id"
	}),
	program: one(programs, {
		fields: [orders.programId],
		references: [programs.id]
	}),
}));

export const programsRelations = relations(programs, ({one, many}) => ({
	enrollments: many(enrollments),
	programWeeks: many(programWeeks),
	orders: many(orders),
	account: one(account, {
		fields: [programs.coachId],
		references: [account.id]
	}),
	workouts: many(workouts),
}));

export const accountRelations = relations(account, ({many}) => ({
	enrollments: many(enrollments),
	orders_buyerId: many(orders, {
		relationName: "orders_buyerId_account_id"
	}),
	orders_coachId: many(orders, {
		relationName: "orders_coachId_account_id"
	}),
	coachProfiles: many(coachProfile),
	programs: many(programs),
}));

export const programWeeksRelations = relations(programWeeks, ({one, many}) => ({
	program: one(programs, {
		fields: [programWeeks.programId],
		references: [programs.id]
	}),
	workouts: many(workouts),
}));

export const coachProfileRelations = relations(coachProfile, ({one}) => ({
	account: one(account, {
		fields: [coachProfile.accountId],
		references: [account.id]
	}),
}));

export const workoutsRelations = relations(workouts, ({one, many}) => ({
	program: one(programs, {
		fields: [workouts.programId],
		references: [programs.id]
	}),
	programWeek: one(programWeeks, {
		fields: [workouts.weekId],
		references: [programWeeks.id]
	}),
	workoutSessions: many(workoutSessions),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({one}) => ({
	workout: one(workouts, {
		fields: [workoutSessions.workoutId],
		references: [workouts.id]
	}),
}));