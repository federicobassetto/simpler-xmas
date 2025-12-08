import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Session - represents a user's journey through the app
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  christmasWish: text("christmas_wish").notNull(),
  email: text("email"),
  summarySentence: text("summary_sentence"),
});

// Question - AI-generated follow-up questions
export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  index: integer("index").notNull(), // 1..5
  text: text("text").notNull(),
  inputType: text("input_type").notNull(), // 'text' | 'single-select' | 'multi-select'
  optionsJson: text("options_json"), // JSON stringified string[]
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Answer - user's answers to questions
export const answers = sqliteTable("answers", {
  id: text("id").primaryKey(),
  questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  valueJson: text("value_json").notNull(), // JSON string; can represent a string or string[]
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// DailyTask - the 25 days of the advent plan (December 1-25)
export const dailyTasks = sqliteTable("daily_tasks", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  dayIndex: integer("day_index").notNull(), // 1..25
  targetDate: integer("target_date", { mode: "timestamp" }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'self-care' | 'connection' | 'decluttering' | 'giving' | 'nature' | 'reflection'
  tagsJson: text("tags_json"), // JSON stringified string[]
  quoteText: text("quote_text"),
  quoteAuthor: text("quote_author"),
  isCompleted: integer("is_completed", { mode: "boolean" }).notNull().default(false),
});

// Type exports for convenience
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
export type DailyTask = typeof dailyTasks.$inferSelect;
export type NewDailyTask = typeof dailyTasks.$inferInsert;

