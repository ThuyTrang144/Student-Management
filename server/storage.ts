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
import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
export interface IStorage {
  // Students
  getStudent(id: string): Promise<Student | undefined>;
  getStudents(): Promise<Student[]>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(
    id: string,
    student: Partial<InsertStudent>,
  ): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;
  searchStudents(query: string): Promise<Student[]>;

  // Lesson Packages
  getLessonPackage(id: string): Promise<LessonPackage | undefined>;
  getLessonPackagesByStudent(studentId: string): Promise<LessonPackage[]>;
  createLessonPackage(
    lessonPackage: InsertLessonPackage,
  ): Promise<LessonPackage>;
  updateLessonPackage(
    id: string,
    lessonPackage: Partial<InsertLessonPackage>,
  ): Promise<LessonPackage | undefined>;

  // Lessons
  getLesson(id: string): Promise<Lesson | undefined>;
  getLessonsByPackage(packageId: string): Promise<Lesson[]>;
  getLessonsByStudent(studentId: string): Promise<Lesson[]>;
  getTodaysLessons(): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: UpdateLesson): Promise<Lesson | undefined>;

  // Documents
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByStudent(studentId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;

  // Combined data
  getStudentWithPackages(id: string): Promise<StudentWithPackages | undefined>;
  getStudentsWithPackages(): Promise<StudentWithPackages[]>;

  // Stats
  getStats(): Promise<{
    totalStudents: number;
    todaysLessons: number;
    pendingAttendance: number;
    completionRate: string;
  }>;
}

export class MemStorage implements IStorage {
  private students: Map<string, Student>;
  private lessonPackages: Map<string, LessonPackage>;
  private lessons: Map<string, Lesson>;
  private documents: Map<string, Document>;
  private dataDir: string;
  private studentsFile: string;
  private packagesFile: string;
  private lessonsFile: string;
  private documentsFile: string;

  constructor() {
    this.students = new Map();
    this.lessonPackages = new Map();
    this.lessons = new Map();
    this.documents = new Map();

    // Setup data directory
    this.dataDir = join(process.cwd(), "data");
    this.studentsFile = join(this.dataDir, "students.json");
    this.packagesFile = join(this.dataDir, "packages.json");
    this.lessonsFile = join(this.dataDir, "lessons.json");
    this.documentsFile = join(this.dataDir, "documents.json");

    // Create data directory if it doesn't exist
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }

    // Load existing data
    this.loadData();
  }

  private loadData() {
    try {
      if (existsSync(this.studentsFile)) {
        const data = JSON.parse(readFileSync(this.studentsFile, "utf-8"));
        this.students = new Map(
          Object.entries(data).map(([k, v]: [string, any]) => [
            k,
            {
              ...v,
              createdAt: v.createdAt ? new Date(v.createdAt) : null,
            },
          ]),
        );
      }

      if (existsSync(this.packagesFile)) {
        const data = JSON.parse(readFileSync(this.packagesFile, "utf-8"));
        this.lessonPackages = new Map(
          Object.entries(data).map(([k, v]: [string, any]) => [
            k,
            {
              ...v,
              createdAt: v.createdAt ? new Date(v.createdAt) : null,
            },
          ]),
        );
      }

      if (existsSync(this.lessonsFile)) {
        const data = JSON.parse(readFileSync(this.lessonsFile, "utf-8"));
        this.lessons = new Map(
          Object.entries(data).map(([k, v]: [string, any]) => [
            k,
            {
              ...v,
              scheduledDate: v.scheduledDate ? new Date(v.scheduledDate) : null,
              completedDate: v.completedDate ? new Date(v.completedDate) : null,
              createdAt: v.createdAt ? new Date(v.createdAt) : null,
            },
          ]),
        );
      }

      if (existsSync(this.documentsFile)) {
        const data = JSON.parse(readFileSync(this.documentsFile, "utf-8"));
        this.documents = new Map(
          Object.entries(data).map(([k, v]: [string, any]) => [
            k,
            {
              ...v,
              uploadedAt: v.uploadedAt ? new Date(v.uploadedAt) : null,
            },
          ]),
        );
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  private saveStudents() {
    const data = Object.fromEntries(this.students);
    writeFileSync(this.studentsFile, JSON.stringify(data, null, 2));
  }

  private savePackages() {
    const data = Object.fromEntries(this.lessonPackages);
    writeFileSync(this.packagesFile, JSON.stringify(data, null, 2));
  }

  private saveLessons() {
    const data = Object.fromEntries(this.lessons);
    writeFileSync(this.lessonsFile, JSON.stringify(data, null, 2));
  }

  private saveDocuments() {
    const data = Object.fromEntries(this.documents);
    writeFileSync(this.documentsFile, JSON.stringify(data, null, 2));
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.email === email,
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = {
      ...insertStudent,
      id,
      phone: insertStudent.phone ?? null,
      createdAt: new Date(),
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(
    id: string,
    updateData: Partial<InsertStudent>,
  ): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;

    const updatedStudent = { ...student, ...updateData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<boolean> {
    return this.students.delete(id);
  }

  async searchStudents(query: string): Promise<Student[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.students.values()).filter(
      (student) =>
        student.firstName.toLowerCase().includes(lowercaseQuery) ||
        student.lastName.toLowerCase().includes(lowercaseQuery) ||
        student.email.toLowerCase().includes(lowercaseQuery),
    );
  }

  async getLessonPackage(id: string): Promise<LessonPackage | undefined> {
    return this.lessonPackages.get(id);
  }

  async getLessonPackagesByStudent(
    studentId: string,
  ): Promise<LessonPackage[]> {
    return Array.from(this.lessonPackages.values()).filter(
      (pkg) => pkg.studentId === studentId,
    );
  }

  async createLessonPackage(
    insertPackage: InsertLessonPackage,
  ): Promise<LessonPackage> {
    const id = randomUUID();
    const lessonPackage: LessonPackage = {
      ...insertPackage,
      id,
      isActive: true,
      createdAt: new Date(),
    };
    this.lessonPackages.set(id, lessonPackage);
    this.savePackages();
    return lessonPackage;
  }

  async updateLessonPackage(
    id: string,
    updateData: Partial<InsertLessonPackage>,
  ): Promise<LessonPackage | undefined> {
    const lessonPackage = this.lessonPackages.get(id);
    if (!lessonPackage) return undefined;

    const updatedPackage = { ...lessonPackage, ...updateData };
    this.lessonPackages.set(id, updatedPackage);
    this.savePackages();
    return updatedPackage;
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async getLessonsByPackage(packageId: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).filter(
      (lesson) => lesson.packageId === packageId,
    );
  }

  async getLessonsByStudent(studentId: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).filter(
      (lesson) => lesson.studentId === studentId,
    );
  }

  async getTodaysLessons(): Promise<Lesson[]> {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    return Array.from(this.lessons.values()).filter(
      (lesson) =>
        lesson.scheduledDate &&
        lesson.scheduledDate >= todayStart &&
        lesson.scheduledDate < todayEnd,
    );
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = randomUUID();
    const lesson: Lesson = {
      ...insertLesson,
      id,
      isCompleted: false,
      completedDate: null,
      scheduledDate: insertLesson.scheduledDate ?? null,
      notes: insertLesson.notes ?? null,
      topic: insertLesson.topic ?? null,
      createdAt: new Date(),
    };
    this.lessons.set(id, lesson);
    this.saveLessons();
    return lesson;
  }

  async updateLesson(
    id: string,
    updateData: UpdateLesson,
  ): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;

    const updatedLesson = { ...lesson, ...updateData };
    this.lessons.set(id, updatedLesson);

    // If lesson is marked as completed, decrease remaining lessons in package
    if (updateData.isCompleted === true && !lesson.isCompleted) {
      const lessonPackage = this.lessonPackages.get(lesson.packageId);
      if (lessonPackage && lessonPackage.remainingLessons > 0) {
        const updatedPackage = {
          ...lessonPackage,
          remainingLessons: lessonPackage.remainingLessons - 1,
        };
        this.lessonPackages.set(lesson.packageId, updatedPackage);
        this.savePackages();
      }
    }

    // If lesson is marked as uncompleted, increase remaining lessons in package
    if (updateData.isCompleted === false && lesson.isCompleted) {
      const lessonPackage = this.lessonPackages.get(lesson.packageId);
      if (lessonPackage) {
        const updatedPackage = {
          ...lessonPackage,
          remainingLessons: lessonPackage.remainingLessons + 1,
        };
        this.lessonPackages.set(lesson.packageId, updatedPackage);
        this.savePackages();
      }
      // Clear the completed date when marking as incomplete
      updatedLesson.completedDate = null;
    }

    this.saveLessons();
    return updatedLesson;
  }

  async getStudentWithPackages(
    studentId: string,
  ): Promise<StudentWithPackages | undefined> {
    const student = this.students.get(studentId);
    if (!student) return undefined;

    const studentPackages = Array.from(this.lessonPackages.values()).filter(
      (pkg) => pkg.studentId === studentId,
    );

    const packages = studentPackages.map((pkg) => ({
      ...pkg,
      lessons: Array.from(this.lessons.values()).filter(
        (lesson) => lesson.packageId === pkg.id,
      ),
    }));

    return { ...student, packages };
  }

  async getStudentsWithPackages(): Promise<StudentWithPackages[]> {
    const students = Array.from(this.students.values());

    return students.map((student) => {
      const packages = Array.from(this.lessonPackages.values())
        .filter((pkg) => pkg.studentId === student.id)
        .map((pkg) => ({
          ...pkg,
          lessons: Array.from(this.lessons.values()).filter(
            (lesson) => lesson.packageId === pkg.id,
          ),
        }));

      return { ...student, packages };
    });
  }

  async getStats(): Promise<{
    totalStudents: number;
    todaysLessons: number;
    pendingAttendance: number;
    completionRate: string;
  }> {
    const totalStudents = this.students.size;
    const todaysLessons = (await this.getTodaysLessons()).length;
    const pendingAttendance = (await this.getTodaysLessons()).filter(
      (lesson) => !lesson.isCompleted,
    ).length;

    const allLessons = Array.from(this.lessons.values());
    const completedLessons = allLessons.filter(
      (lesson) => lesson.isCompleted,
    ).length;
    const completionRate =
      allLessons.length > 0
        ? Math.round((completedLessons / allLessons.length) * 100)
        : 0;

    return {
      totalStudents,
      todaysLessons,
      pendingAttendance,
      completionRate: `${completionRate}%`,
    };
  }

  // Document methods
  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByStudent(studentId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.studentId === studentId,
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      notes: insertDocument.notes ?? null,
      fileType: insertDocument.fileType ?? null,
      uploadedAt: new Date(),
    };
    this.documents.set(id, document);
    this.saveDocuments();
    return document;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = this.documents.delete(id);
    if (result) {
      this.saveDocuments();
    }
    return result;
  }
}

// Factory function to create storage based on environment
export async function getStorage(): Promise<IStorage> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    console.log("Using Supabase storage");
    const { SupabaseStorage } = await import("./supabase-storage.js");
    return new SupabaseStorage(supabaseUrl, supabaseKey);
  }

  console.log("Using in-memory storage with JSON persistence");
  return new MemStorage();
}

// For backward compatibility - initialize storage
let storageInstance: IStorage | null = null;

export const storage = new Proxy({} as IStorage, {
  get: (target, prop) => {
    if (!storageInstance) {
      throw new Error(
        "Storage not initialized. Use getStorage() or await storage initialization.",
      );
    }
    return (storageInstance as any)[prop];
  },
});

// Initialize storage
getStorage().then((instance) => {
  storageInstance = instance;
});
