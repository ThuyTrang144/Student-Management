import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessonPackages = pgTable("lesson_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  packageType: text("package_type").notNull(), // e.g., "Piano Lessons", "Guitar Lessons"
  totalLessons: integer("total_lessons").notNull(),
  remainingLessons: integer("remaining_lessons").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageId: varchar("package_id").notNull().references(() => lessonPackages.id),
  studentId: varchar("student_id").notNull().references(() => students.id),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
});

export const insertLessonPackageSchema = createInsertSchema(lessonPackages).pick({
  studentId: true,
  packageType: true,
  totalLessons: true,
  remainingLessons: true,
});

export const insertLessonSchema = createInsertSchema(lessons).pick({
  packageId: true,
  studentId: true,
  scheduledDate: true,
  notes: true,
});

export const updateLessonSchema = createInsertSchema(lessons).pick({
  completedDate: true,
  isCompleted: true,
  notes: true,
}).partial();

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertLessonPackage = z.infer<typeof insertLessonPackageSchema>;
export type LessonPackage = typeof lessonPackages.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type UpdateLesson = z.infer<typeof updateLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

export type StudentWithPackages = Student & {
  packages: (LessonPackage & { lessons: Lesson[] })[];
};
