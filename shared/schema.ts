import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessonPackages = pgTable("lesson_packages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id),
  packageType: text("package_type").notNull(), // e.g., "Piano Lessons", "Guitar Lessons"
  totalLessons: integer("total_lessons").notNull(),
  remainingLessons: integer("remaining_lessons").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  packageId: varchar("package_id")
    .notNull()
    .references(() => lessonPackages.id),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
  topic: text("topic"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  notes: text("notes"),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
});

export const insertLessonPackageSchema = createInsertSchema(
  lessonPackages,
).pick({
  studentId: true,
  packageType: true,
  totalLessons: true,
  remainingLessons: true,
});

export const insertLessonSchema = z.object({
  packageId: z.string(),
  studentId: z.string(),
  scheduledDate: z.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  topic: z.string().nullable().optional(),
});

export const updateLessonSchema = createInsertSchema(lessons)
  .pick({
    completedDate: true,
    isCompleted: true,
    notes: true,
    topic: true,
  })
  .partial();

export const insertDocumentSchema = createInsertSchema(documents).pick({
  studentId: true,
  fileName: true,
  fileUrl: true,
  fileType: true,
  notes: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertLessonPackage = z.infer<typeof insertLessonPackageSchema>;
export type LessonPackage = typeof lessonPackages.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type UpdateLesson = z.infer<typeof updateLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type StudentWithPackages = Student & {
  packages: (LessonPackage & { lessons: Lesson[] })[];
};

export type StudentDetail = Student & {
  packages: (LessonPackage & { lessons: Lesson[] })[];
  documents: Document[];
};
