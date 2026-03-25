import { pgTable, text, serial, integer, date, timestamp, unique, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const periodEnum = pgEnum("period", ["morning", "afternoon", "evening"]);

export const moodsTable = pgTable("moods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  date: date("date", { mode: "string" }).notNull(),
  period: periodEnum("period").notNull().default("morning"),
  mood: integer("mood").notNull(),
  energy: integer("energy").notNull().default(50),
  consumption: integer("consumption").notNull().default(0),
  note: text("note"),
  lunarPhase: text("lunar_phase").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("moods_user_date_period_unique").on(table.userId, table.date, table.period),
]);

export const insertMoodSchema = createInsertSchema(moodsTable).omit({ id: true, createdAt: true });
export type InsertMood = z.infer<typeof insertMoodSchema>;
export type MoodEntry = typeof moodsTable.$inferSelect;
