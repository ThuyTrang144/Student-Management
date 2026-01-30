import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  type Student,
  type InsertStudent,
  type LessonPackage,
  type InsertLessonPackage,
  type Lesson,
  type InsertLesson,
  type UpdateLesson,
  type StudentWithPackages,
  type Document,
  type InsertDocument,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class SupabaseStorage implements IStorage {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Students
  async getStudent(id: string): Promise<Student | undefined> {
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return this.mapStudent(data);
  }

  async getStudents(): Promise<Student[]> {
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return [];
    return data.map(this.mapStudent);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .eq("email", email)
      .single();

    if (error) return undefined;
    return this.mapStudent(data);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const { data, error } = await this.supabase
      .from("students")
      .insert({
        first_name: student.firstName,
        last_name: student.lastName,
        email: student.email,
        phone: student.phone,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create student: ${error.message}`);
    return this.mapStudent(data);
  }

  async updateStudent(
    id: string,
    student: Partial<InsertStudent>,
  ): Promise<Student | undefined> {
    const updateData: any = {};
    if (student.firstName) updateData.first_name = student.firstName;
    if (student.lastName) updateData.last_name = student.lastName;
    if (student.email) updateData.email = student.email;
    if (student.phone !== undefined) updateData.phone = student.phone;

    const { data, error } = await this.supabase
      .from("students")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return undefined;
    return this.mapStudent(data);
  }

  async deleteStudent(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("students")
      .delete()
      .eq("id", id);

    return !error;
  }

  async searchStudents(query: string): Promise<Student[]> {
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`,
      );

    if (error) return [];
    return data.map(this.mapStudent);
  }

  // Lesson Packages
  async getLessonPackage(id: string): Promise<LessonPackage | undefined> {
    const { data, error } = await this.supabase
      .from("lesson_packages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return this.mapLessonPackage(data);
  }

  async getLessonPackagesByStudent(
    studentId: string,
  ): Promise<LessonPackage[]> {
    const { data, error } = await this.supabase
      .from("lesson_packages")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data.map(this.mapLessonPackage);
  }

  async createLessonPackage(
    lessonPackage: InsertLessonPackage,
  ): Promise<LessonPackage> {
    const { data, error } = await this.supabase
      .from("lesson_packages")
      .insert({
        student_id: lessonPackage.studentId,
        package_type: lessonPackage.packageType,
        total_lessons: lessonPackage.totalLessons,
        remaining_lessons: lessonPackage.remainingLessons,
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create lesson package: ${error.message}`);
    return this.mapLessonPackage(data);
  }

  async updateLessonPackage(
    id: string,
    lessonPackage: Partial<InsertLessonPackage>,
  ): Promise<LessonPackage | undefined> {
    const updateData: any = {};
    if (lessonPackage.packageType)
      updateData.package_type = lessonPackage.packageType;
    if (lessonPackage.totalLessons !== undefined)
      updateData.total_lessons = lessonPackage.totalLessons;
    if (lessonPackage.remainingLessons !== undefined)
      updateData.remaining_lessons = lessonPackage.remainingLessons;

    const { data, error } = await this.supabase
      .from("lesson_packages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return undefined;
    return this.mapLessonPackage(data);
  }

  // Lessons
  async getLesson(id: string): Promise<Lesson | undefined> {
    const { data, error } = await this.supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return this.mapLesson(data);
  }

  async getLessonsByPackage(packageId: string): Promise<Lesson[]> {
    const { data, error } = await this.supabase
      .from("lessons")
      .select("*")
      .eq("package_id", packageId)
      .order("scheduled_date", { ascending: false, nullsFirst: false });

    if (error) return [];
    return data.map(this.mapLesson);
  }

  async getLessonsByStudent(studentId: string): Promise<Lesson[]> {
    const { data, error } = await this.supabase
      .from("lessons")
      .select("*")
      .eq("student_id", studentId)
      .order("scheduled_date", { ascending: false, nullsFirst: false });

    if (error) return [];
    return data.map(this.mapLesson);
  }

  async getTodaysLessons(): Promise<Lesson[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await this.supabase
      .from("lessons")
      .select("*")
      .gte("scheduled_date", today.toISOString())
      .lt("scheduled_date", tomorrow.toISOString())
      .order("scheduled_date", { ascending: true });

    if (error) return [];
    return data.map(this.mapLesson);
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const { data, error } = await this.supabase
      .from("lessons")
      .insert({
        package_id: lesson.packageId,
        student_id: lesson.studentId,
        scheduled_date: lesson.scheduledDate || null,
        notes: lesson.notes || null,
        topic: lesson.topic || null,
        is_completed: false,
        completed_date: null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create lesson: ${error.message}`);
    return this.mapLesson(data);
  }

  async updateLesson(
    id: string,
    updateData: UpdateLesson,
  ): Promise<Lesson | undefined> {
    const lesson = await this.getLesson(id);
    if (!lesson) return undefined;

    const dbUpdateData: any = {};
    if (updateData.completedDate !== undefined)
      dbUpdateData.completed_date = updateData.completedDate;
    if (updateData.isCompleted !== undefined)
      dbUpdateData.is_completed = updateData.isCompleted;
    if (updateData.notes !== undefined) dbUpdateData.notes = updateData.notes;
    if (updateData.topic !== undefined) dbUpdateData.topic = updateData.topic;

    // Handle lesson package remaining lessons
    if (updateData.isCompleted === true && !lesson.isCompleted) {
      const lessonPackage = await this.getLessonPackage(lesson.packageId);
      if (lessonPackage && lessonPackage.remainingLessons > 0) {
        await this.supabase
          .from("lesson_packages")
          .update({ remaining_lessons: lessonPackage.remainingLessons - 1 })
          .eq("id", lesson.packageId);
      }
    }

    // Handle uncomplete
    if (updateData.isCompleted === false && lesson.isCompleted) {
      const lessonPackage = await this.getLessonPackage(lesson.packageId);
      if (lessonPackage) {
        await this.supabase
          .from("lesson_packages")
          .update({ remaining_lessons: lessonPackage.remainingLessons + 1 })
          .eq("id", lesson.packageId);
      }
      dbUpdateData.completed_date = null;
    }

    const { data, error } = await this.supabase
      .from("lessons")
      .update(dbUpdateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return undefined;
    return this.mapLesson(data);
  }

  // Documents
  async getDocument(id: string): Promise<Document | undefined> {
    const { data, error } = await this.supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return this.mapDocument(data);
  }

  async getDocumentsByStudent(studentId: string): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from("documents")
      .select("*")
      .eq("student_id", studentId)
      .order("uploaded_at", { ascending: false });

    if (error) return [];
    return data.map(this.mapDocument);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const { data, error } = await this.supabase
      .from("documents")
      .insert({
        student_id: document.studentId,
        file_name: document.fileName,
        file_url: document.fileUrl,
        file_type: document.fileType || null,
        notes: document.notes || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create document: ${error.message}`);
    return this.mapDocument(data);
  }

  async deleteDocument(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("documents")
      .delete()
      .eq("id", id);
    return !error;
  }

  async getStudentWithPackages(
    studentId: string,
  ): Promise<StudentWithPackages | undefined> {
    const student = await this.getStudent(studentId);
    if (!student) return undefined;

    const packages = await this.getLessonPackagesByStudent(studentId);
    const packagesWithLessons = await Promise.all(
      packages.map(async (pkg) => {
        const lessons = await this.getLessonsByPackage(pkg.id);
        return { ...pkg, lessons };
      }),
    );

    return { ...student, packages: packagesWithLessons };
  }

  // Helper methods to map snake_case to camelCase
  private mapStudent(data: any): Student {
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      createdAt: new Date(data.created_at),
    };
  }

  private mapLessonPackage(data: any): LessonPackage {
    return {
      id: data.id,
      studentId: data.student_id,
      packageType: data.package_type,
      totalLessons: data.total_lessons,
      remainingLessons: data.remaining_lessons,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
    };
  }

  private mapLesson(data: any): Lesson {
    return {
      id: data.id,
      packageId: data.package_id,
      studentId: data.student_id,
      scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : null,
      completedDate: data.completed_date ? new Date(data.completed_date) : null,
      isCompleted: data.is_completed,
      notes: data.notes,
      topic: data.topic,
      createdAt: new Date(data.created_at),
    };
  }

  private mapDocument(data: any): Document {
    return {
      id: data.id,
      studentId: data.student_id,
      fileName: data.file_name,
      fileUrl: data.file_url,
      fileType: data.file_type,
      uploadedAt: new Date(data.uploaded_at),
      notes: data.notes,
    };
  }

  async getStudentsWithPackages(): Promise<StudentWithPackages[]> {
    const students = await this.getStudents();
    const studentsWithPackages = await Promise.all(
      students.map(async (student) => {
        const packages = await this.getLessonPackagesByStudent(student.id);
        const packagesWithLessons = await Promise.all(
          packages.map(async (pkg) => {
            const lessons = await this.getLessonsByPackage(pkg.id);
            return { ...pkg, lessons };
          }),
        );
        return { ...student, packages: packagesWithLessons };
      }),
    );
    return studentsWithPackages;
  }

  async getStats(): Promise<{
    totalStudents: number;
    todaysLessons: number;
    pendingAttendance: number;
    completionRate: string;
  }> {
    const students = await this.getStudents();
    const todaysLessons = await this.getTodaysLessons();
    const pendingAttendance = todaysLessons.filter(
      (lesson) => !lesson.isCompleted,
    ).length;

    // Get all lessons for completion rate
    const { data: allLessonsData } = await this.supabase
      .from("lessons")
      .select("is_completed");

    const allLessons = allLessonsData || [];
    const completedLessons = allLessons.filter(
      (lesson) => lesson.is_completed,
    ).length;
    const completionRate =
      allLessons.length > 0
        ? Math.round((completedLessons / allLessons.length) * 100)
        : 0;

    return {
      totalStudents: students.length,
      todaysLessons: todaysLessons.length,
      pendingAttendance,
      completionRate: `${completionRate}%`,
    };
  }
}
