import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import {
  ArrowLeft,
  Plus,
  Edit,
  Save,
  X,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { StudentDetail, Lesson, Document } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import EditStudentModal from "@/components/students/edit-student-modal";

export default function StudentDetail() {
  const [, params] = useRoute("/students/:id");
  const [, navigate] = useLocation();
  const studentId = params?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<{
    topic: string;
    notes: string;
  }>({ topic: "", notes: "" });
  const [newLesson, setNewLesson] = useState({
    topic: "",
    notes: "",
    scheduledDate: "",
  });
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    fileName: "",
    fileUrl: "",
    notes: "",
  });

  const { data: student, isLoading } = useQuery<StudentDetail>({
    queryKey: [`/api/students/${studentId}`],
    enabled: !!studentId,
  });

  const updateLessonMutation = useMutation({
    mutationFn: async ({ lessonId, data }: { lessonId: string; data: any }) => {
      const response = await apiRequest(
        "PUT",
        `/api/lessons/${lessonId}`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/students/${studentId}`],
      });
      toast({ title: "Success", description: "Lesson updated successfully" });
      setEditingLesson(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lesson",
        variant: "destructive",
      });
    },
  });

  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/lessons/${lessonId}/complete`,
        {},
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/students/${studentId}`],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Success", description: "Lesson marked as complete" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete lesson",
        variant: "destructive",
      });
    },
  });

  const uncompleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/lessons/${lessonId}/uncomplete`,
        {},
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/students/${studentId}`],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Success", description: "Lesson marked as incomplete" });
    },
    onError: (error: any) => {
      console.error("Uncomplete lesson error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to uncomplete lesson",
        variant: "destructive",
      });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/lessons", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/students/${studentId}`],
      });
      toast({ title: "Success", description: "Lesson created successfully" });
      setShowAddLesson(false);
      setNewLesson({ topic: "", notes: "", scheduledDate: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create lesson",
        variant: "destructive",
      });
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/documents", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/students/${studentId}`],
      });
      toast({ title: "Success", description: "Document added successfully" });
      setDocumentForm({ fileName: "", fileUrl: "", notes: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await apiRequest(
        "DELETE",
        `/api/documents/${documentId}`,
        {},
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/students/${studentId}`],
      });
      toast({ title: "Success", description: "Document deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson.id);
    setLessonForm({ topic: lesson.topic || "", notes: lesson.notes || "" });
  };

  const handleSaveLesson = (lessonId: string) => {
    updateLessonMutation.mutate({ lessonId, data: lessonForm });
  };

  const handleAddLesson = () => {
    if (!student) return;
    const activePackage = student.packages.find((pkg) => pkg.isActive);
    if (!activePackage) {
      toast({
        title: "Error",
        description: "No active package found",
        variant: "destructive",
      });
      return;
    }
    createLessonMutation.mutate({
      packageId: activePackage.id,
      studentId: student.id,
      scheduledDate: newLesson.scheduledDate
        ? new Date(newLesson.scheduledDate)
        : null,
      topic: newLesson.topic || null,
      notes: newLesson.notes || null,
    });
  };

  const handleAddDocument = () => {
    if (!studentId || !documentForm.fileName || !documentForm.fileUrl) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }
    createDocumentMutation.mutate({
      studentId,
      fileName: documentForm.fileName,
      fileUrl: documentForm.fileUrl,
      notes: documentForm.notes,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <Button onClick={() => navigate("/students")} className="mt-4">
          Back to Students
        </Button>
      </div>
    );
  }

  const activePackage = student.packages.find((pkg) => pkg.isActive);
  const allLessons = student.packages
    .flatMap((pkg) => pkg.lessons)
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    );
  const completedLessons = allLessons.filter((l) => l.isCompleted);
  const upcomingLessons = allLessons.filter((l) => !l.isCompleted);
  const totalAttended = completedLessons.length;
  const lessonsLeft = activePackage?.remainingLessons || 0;
  const nextTopic = upcomingLessons[0]?.topic || "Not scheduled";
  const lastCompletedTopic = completedLessons[0]?.topic || "None";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/students")}
          >
            <ArrowLeft className="mr-2" size={16} />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-gray-600">{student.email}</p>
          </div>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Edit className="mr-2" size={16} />
          Edit Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600">Lessons Attended</div>
            <div className="text-3xl font-bold text-blue-600">
              {totalAttended}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600">Lessons Remaining</div>
            <div className="text-3xl font-bold text-green-600">
              {lessonsLeft}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600">Last Topic</div>
            <div className="text-lg font-semibold text-gray-800 truncate">
              {lastCompletedTopic}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600">Next Topic</div>
            <div className="text-lg font-semibold text-gray-800 truncate">
              {nextTopic}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lessons Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lesson History</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowAddLesson(!showAddLesson)}
              >
                <Plus className="mr-2" size={16} />
                Add Lesson
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddLesson && (
                <div className="p-4 border rounded-lg bg-blue-50 space-y-3">
                  <div className="space-y-2">
                    <Label>Topic</Label>
                    <Input
                      value={newLesson.topic}
                      onChange={(e) =>
                        setNewLesson({ ...newLesson, topic: e.target.value })
                      }
                      placeholder="Enter lesson topic"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input
                      type="datetime-local"
                      value={newLesson.scheduledDate}
                      onChange={(e) =>
                        setNewLesson({
                          ...newLesson,
                          scheduledDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newLesson.notes}
                      onChange={(e) =>
                        setNewLesson({ ...newLesson, notes: e.target.value })
                      }
                      placeholder="Add notes..."
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleAddLesson}
                      disabled={createLessonMutation.isPending}
                    >
                      {createLessonMutation.isPending
                        ? "Adding..."
                        : "Add Lesson"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddLesson(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {allLessons.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No lessons recorded yet
                </p>
              ) : (
                <div className="space-y-3">
                  {allLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {editingLesson === lesson.id ? (
                            <Input
                              value={lessonForm.topic}
                              onChange={(e) =>
                                setLessonForm({
                                  ...lessonForm,
                                  topic: e.target.value,
                                })
                              }
                              placeholder="Lesson topic"
                              className="mb-2"
                            />
                          ) : (
                            <div className="font-semibold text-gray-800">
                              {lesson.topic || "Untitled Lesson"}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {lesson.scheduledDate &&
                              format(new Date(lesson.scheduledDate), "PPp")}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {lesson.isCompleted ? (
                            <Badge className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pending
                            </Badge>
                          )}
                          {editingLesson === lesson.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSaveLesson(lesson.id)}
                              >
                                <Save size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingLesson(null)}
                              >
                                <X size={14} />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditLesson(lesson)}
                            >
                              <Edit size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                      {editingLesson === lesson.id ? (
                        <Textarea
                          value={lessonForm.notes}
                          onChange={(e) =>
                            setLessonForm({
                              ...lessonForm,
                              notes: e.target.value,
                            })
                          }
                          placeholder="Add notes..."
                          rows={3}
                        />
                      ) : (
                        lesson.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            {lesson.notes}
                          </p>
                        )
                      )}
                      {editingLesson !== lesson.id && (
                        <div className="mt-3 flex space-x-2">
                          {!lesson.isCompleted ? (
                            <Button
                              size="sm"
                              onClick={() =>
                                completeLessonMutation.mutate(lesson.id)
                              }
                              disabled={completeLessonMutation.isPending}
                            >
                              Mark as Complete
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                uncompleteLessonMutation.mutate(lesson.id)
                              }
                              disabled={uncompleteLessonMutation.isPending}
                            >
                              Mark as Incomplete
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documents Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Document Form */}
              <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input
                    value={documentForm.fileName}
                    onChange={(e) =>
                      setDocumentForm({
                        ...documentForm,
                        fileName: e.target.value,
                      })
                    }
                    placeholder="e.g., Progress Report"
                  />
                </div>
                <div className="space-y-2">
                  <Label>File URL</Label>
                  <Input
                    value={documentForm.fileUrl}
                    onChange={(e) =>
                      setDocumentForm({
                        ...documentForm,
                        fileUrl: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input
                    value={documentForm.notes}
                    onChange={(e) =>
                      setDocumentForm({
                        ...documentForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Add notes..."
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleAddDocument}
                  disabled={createDocumentMutation.isPending}
                >
                  <Upload className="mr-2" size={14} />
                  {createDocumentMutation.isPending
                    ? "Adding..."
                    : "Add Document"}
                </Button>
              </div>

              {/* Documents List */}
              {student.documents && student.documents.length > 0 ? (
                <div className="space-y-2">
                  {student.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText
                          size={16}
                          className="text-blue-600 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline truncate block"
                          >
                            {doc.fileName}
                          </a>
                          {doc.notes && (
                            <p className="text-xs text-gray-500 truncate">
                              {doc.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteDocumentMutation.mutate(doc.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No documents yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={student}
      />
    </div>
  );
}
