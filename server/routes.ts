import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage, type IStorage } from "./storage";
import {
  insertStudentSchema,
  insertLessonPackageSchema,
  insertLessonSchema,
  updateLessonSchema,
  insertDocumentSchema,
} from "@shared/schema";
import { z } from "zod";

let storage: IStorage;

const createStudentWithPackageSchema = z.object({
  student: insertStudentSchema,
  packageType: z.string(),
  totalLessons: z.number().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize storage
  storage = await getStorage();
  // Students routes
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getStudentsWithPackages();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudentWithPackages(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      const documents = await storage.getDocumentsByStudent(req.params.id);
      res.json({ ...student, documents });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const {
        student: studentData,
        packageType,
        totalLessons,
      } = createStudentWithPackageSchema.parse(req.body);

      // Check if email already exists
      const existingStudent = await storage.getStudentByEmail(
        studentData.email,
      );
      if (existingStudent) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create student
      const student = await storage.createStudent(studentData);

      // Create lesson package
      const lessonPackage = await storage.createLessonPackage({
        studentId: student.id,
        packageType,
        totalLessons,
        remainingLessons: totalLessons,
      });

      const studentWithPackages = await storage.getStudentWithPackages(
        student.id,
      );
      res.status(201).json(studentWithPackages);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid student data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create student" });
      }
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.updateStudent(req.params.id, studentData);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid student data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update student" });
      }
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const success = await storage.deleteStudent(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  app.get("/api/students/search/:query", async (req, res) => {
    try {
      const students = await storage.searchStudents(req.params.query);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to search students" });
    }
  });

  // Lesson packages routes
  app.post("/api/lesson-packages", async (req, res) => {
    try {
      const packageData = insertLessonPackageSchema.parse(req.body);
      const lessonPackage = await storage.createLessonPackage(packageData);
      res.status(201).json(lessonPackage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid package data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create lesson package" });
      }
    }
  });

  // Lessons routes
  app.get("/api/lessons/today", async (req, res) => {
    try {
      const lessons = await storage.getTodaysLessons();
      // Enrich with student data
      const enrichedLessons = await Promise.all(
        lessons.map(async (lesson) => {
          const student = await storage.getStudent(lesson.studentId);
          const lessonPackage = await storage.getLessonPackage(
            lesson.packageId,
          );
          return {
            ...lesson,
            student,
            lessonPackage,
          };
        }),
      );
      res.json(enrichedLessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's lessons" });
    }
  });

  app.post("/api/lessons", async (req, res) => {
    try {
      const lessonData = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid lesson data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create lesson" });
      }
    }
  });

  app.put("/api/lessons/:id", async (req, res) => {
    try {
      const lessonData = updateLessonSchema.parse(req.body);
      const lesson = await storage.updateLesson(req.params.id, lessonData);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid lesson data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update lesson" });
      }
    }
  });

  app.post("/api/lessons/:id/complete", async (req, res) => {
    try {
      const lesson = await storage.updateLesson(req.params.id, {
        isCompleted: true,
        completedDate: new Date(),
      });
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete lesson" });
    }
  });

  app.post("/api/lessons/:id/uncomplete", async (req, res) => {
    try {
      const lesson = await storage.getLesson(req.params.id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      // Update the lesson to mark it as incomplete
      const updatedLesson = await storage.updateLesson(req.params.id, {
        isCompleted: false,
      });

      res.json(updatedLesson);
    } catch (error) {
      console.error("Uncomplete error:", error);
      res.status(500).json({ message: "Failed to uncomplete lesson" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Documents routes
  app.get("/api/documents/student/:studentId", async (req, res) => {
    try {
      const documents = await storage.getDocumentsByStudent(
        req.params.studentId,
      );
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid document data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create document" });
      }
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const success = await storage.deleteDocument(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
