import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const account = pgTable("account", {
  id: uuid().primaryKey().notNull(),
  email: text(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  role: text().default("USER"),
});

export type InsertAccount = typeof account.$inferInsert;
export type SelectAccount = typeof account.$inferSelect;
