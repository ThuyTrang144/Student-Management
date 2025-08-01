import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface LessonCardProps {
  lesson: {
    id: string;
    scheduledDate: string | null;
    isCompleted: boolean;
    student: {
      firstName: string;
      lastName: string;
    };
    lessonPackage: {
      packageType: string;
    };
  };
}

export default function LessonCard({ lesson }: LessonCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/lessons/${lesson.id}/complete`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lessons/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Success",
        description: "Lesson marked as complete",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete lesson",
        variant: "destructive",
      });
    },
  });

  const colorClass = lesson.lessonPackage.packageType.includes("Piano") 
    ? "bg-primary" 
    : lesson.lessonPackage.packageType.includes("Guitar")
    ? "bg-secondary"
    : "bg-amber-600";

  const timeDisplay = lesson.scheduledDate 
    ? format(new Date(lesson.scheduledDate), "h:mm a")
    : "Time TBD";

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-2 h-8 ${colorClass} rounded-full mr-3`}></div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {lesson.student.firstName} {lesson.student.lastName}
          </p>
          <p className="text-xs text-gray-500">{timeDisplay}</p>
          <p className="text-xs text-gray-500">{lesson.lessonPackage.packageType}</p>
        </div>
      </div>
      {!lesson.isCompleted ? (
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => completeLessonMutation.mutate()}
          disabled={completeLessonMutation.isPending}
        >
          {completeLessonMutation.isPending ? "Marking..." : "Mark Complete"}
        </Button>
      ) : (
        <Button size="sm" variant="secondary" disabled>
          Completed
        </Button>
      )}
    </div>
  );
}
