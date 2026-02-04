import "dotenv/config";
import express from "express";
import { getStorage } from "../server/storage.js";
import {
  insertStudentSchema,
  insertLessonPackageSchema,
  insertLessonSchema,
  updateLessonSchema,
  insertDocumentSchema,
} from "../shared/schema.js";
import { z } from "zod";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const createStudentWithPackageSchema = z.object({
  student: insertStudentSchema,
  packageType: z.string(),
  totalLessons: z.number().min(1),
});

let storage = null;
let storagePromise = null;

async function initStorage() {
  if (!storage) {
    if (!storagePromise) {
      storagePromise = getStorage();
    }
    storage = await storagePromise;
  }
  return storage;
}

// Students routes
app.get("/api/students", async (req, res) => {
  try {
    const store = await initStorage();
    const students = await store.getStudentsWithPackages();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const store = await initStorage();
    const student = await store.getStudentWithPackages(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const documents = await store.getDocumentsByStudent(req.params.id);
    res.json({ ...student, documents });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const store = await initStorage();
    const {
      student: studentData,
      packageType,
      totalLessons,
    } = createStudentWithPackageSchema.parse(req.body);
    const student = await store.createStudent(studentData);
    const lessonPackage = await store.createLessonPackage({
      studentId: student.id,
      packageType,
      totalLessons,
      remainingLessons: totalLessons,
    });
    res.status(201).json({ ...student, packages: [lessonPackage] });
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
    const store = await initStorage();
    const studentData = insertStudentSchema.partial().parse(req.body);
    const student = await store.updateStudent(req.params.id, studentData);
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
    const store = await initStorage();
    const success = await store.deleteStudent(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete student" });
  }
});

// Lesson packages routes
app.get("/api/students/:studentId/packages", async (req, res) => {
  try {
    const store = await initStorage();
    const packages = await store.getLessonPackagesByStudent(
      req.params.studentId,
    );
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lesson packages" });
  }
});

app.post("/api/packages", async (req, res) => {
  try {
    const store = await initStorage();
    const packageData = insertLessonPackageSchema.parse(req.body);
    const lessonPackage = await store.createLessonPackage(packageData);
    res.status(201).json(lessonPackage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ message: "Invalid package data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create package" });
    }
  }
});

// Lessons routes
app.get("/api/lessons/today", async (req, res) => {
  try {
    const store = await initStorage();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lessons = await store.getLessonsByDateRange(today, tomorrow);
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
});

app.post("/api/lessons", async (req, res) => {
  try {
    const store = await initStorage();
    const lessonData = insertLessonSchema.parse(req.body);
    const lesson = await store.createLesson(lessonData);
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
    const store = await initStorage();
    const lessonData = updateLessonSchema.parse(req.body);
    const lesson = await store.updateLesson(req.params.id, lessonData);
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
    const store = await initStorage();
    const lesson = await store.completeLesson(req.params.id);
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
    const store = await initStorage();
    const lesson = await store.uncompleteLesson(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: "Failed to uncomplete lesson" });
  }
});

// Documents routes
app.get("/api/students/:studentId/documents", async (req, res) => {
  try {
    const store = await initStorage();
    const documents = await store.getDocumentsByStudent(req.params.studentId);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch documents" });
  }
});

app.post("/api/documents", async (req, res) => {
  try {
    const store = await initStorage();
    const documentData = insertDocumentSchema.parse(req.body);
    const document = await store.createDocument(documentData);
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
    const store = await initStorage();
    const success = await store.deleteDocument(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete document" });
  }
});

app.get("/api/documents/:id/url", async (req, res) => {
  try {
    const store = await initStorage();
    const url = await store.getDocumentUrl(req.params.id);
    if (!url) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: "Failed to get document URL" });
  }
});

export default app;
