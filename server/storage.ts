import { 
  type Student, 
  type InsertStudent,
  type LessonPackage,
  type InsertLessonPackage,
  type Lesson,
  type InsertLesson,
  type UpdateLesson,
  type StudentWithPackages
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Students
  getStudent(id: string): Promise<Student | undefined>;
  getStudents(): Promise<Student[]>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;
  searchStudents(query: string): Promise<Student[]>;
  
  // Lesson Packages
  getLessonPackage(id: string): Promise<LessonPackage | undefined>;
  getLessonPackagesByStudent(studentId: string): Promise<LessonPackage[]>;
  createLessonPackage(lessonPackage: InsertLessonPackage): Promise<LessonPackage>;
  updateLessonPackage(id: string, lessonPackage: Partial<InsertLessonPackage>): Promise<LessonPackage | undefined>;
  
  // Lessons
  getLesson(id: string): Promise<Lesson | undefined>;
  getLessonsByPackage(packageId: string): Promise<Lesson[]>;
  getLessonsByStudent(studentId: string): Promise<Lesson[]>;
  getTodaysLessons(): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: UpdateLesson): Promise<Lesson | undefined>;
  
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

  constructor() {
    this.students = new Map();
    this.lessonPackages = new Map();
    this.lessons = new Map();
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
      createdAt: new Date()
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
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
        student.email.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getLessonPackage(id: string): Promise<LessonPackage | undefined> {
    return this.lessonPackages.get(id);
  }

  async getLessonPackagesByStudent(studentId: string): Promise<LessonPackage[]> {
    return Array.from(this.lessonPackages.values()).filter(
      (pkg) => pkg.studentId === studentId
    );
  }

  async createLessonPackage(insertPackage: InsertLessonPackage): Promise<LessonPackage> {
    const id = randomUUID();
    const lessonPackage: LessonPackage = {
      ...insertPackage,
      id,
      isActive: true,
      createdAt: new Date()
    };
    this.lessonPackages.set(id, lessonPackage);
    return lessonPackage;
  }

  async updateLessonPackage(id: string, updateData: Partial<InsertLessonPackage>): Promise<LessonPackage | undefined> {
    const lessonPackage = this.lessonPackages.get(id);
    if (!lessonPackage) return undefined;
    
    const updatedPackage = { ...lessonPackage, ...updateData };
    this.lessonPackages.set(id, updatedPackage);
    return updatedPackage;
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async getLessonsByPackage(packageId: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).filter(
      (lesson) => lesson.packageId === packageId
    );
  }

  async getLessonsByStudent(studentId: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).filter(
      (lesson) => lesson.studentId === studentId
    );
  }

  async getTodaysLessons(): Promise<Lesson[]> {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return Array.from(this.lessons.values()).filter(
      (lesson) => 
        lesson.scheduledDate && 
        lesson.scheduledDate >= todayStart && 
        lesson.scheduledDate < todayEnd
    );
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = randomUUID();
    const lesson: Lesson = {
      ...insertLesson,
      id,
      isCompleted: false,
      completedDate: null,
      createdAt: new Date()
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async updateLesson(id: string, updateData: UpdateLesson): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    
    const updatedLesson = { ...lesson, ...updateData };
    this.lessons.set(id, updatedLesson);
    
    // If lesson is marked as completed, update remaining lessons in package
    if (updateData.isCompleted && !lesson.isCompleted) {
      const lessonPackage = this.lessonPackages.get(lesson.packageId);
      if (lessonPackage && lessonPackage.remainingLessons > 0) {
        const updatedPackage = { 
          ...lessonPackage, 
          remainingLessons: lessonPackage.remainingLessons - 1 
        };
        this.lessonPackages.set(lesson.packageId, updatedPackage);
      }
    }
    
    return updatedLesson;
  }

  async getStudentWithPackages(id: string): Promise<StudentWithPackages | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const packages = Array.from(this.lessonPackages.values())
      .filter((pkg) => pkg.studentId === id)
      .map((pkg) => ({
        ...pkg,
        lessons: Array.from(this.lessons.values()).filter((lesson) => lesson.packageId === pkg.id)
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
          lessons: Array.from(this.lessons.values()).filter((lesson) => lesson.packageId === pkg.id)
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
    const pendingAttendance = (await this.getTodaysLessons()).filter(lesson => !lesson.isCompleted).length;
    
    const allLessons = Array.from(this.lessons.values());
    const completedLessons = allLessons.filter(lesson => lesson.isCompleted).length;
    const completionRate = allLessons.length > 0 
      ? Math.round((completedLessons / allLessons.length) * 100) 
      : 0;
    
    return {
      totalStudents,
      todaysLessons,
      pendingAttendance,
      completionRate: `${completionRate}%`
    };
  }
}

export const storage = new MemStorage();
