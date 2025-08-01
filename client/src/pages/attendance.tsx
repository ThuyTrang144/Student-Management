import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import LessonCard from "@/components/attendance/lesson-card";

export default function Attendance() {
  const { data: todaysLessons = [], isLoading } = useQuery({
    queryKey: ["/api/lessons/today"],
  });

  const completedLessons = todaysLessons.filter((lesson: any) => lesson.isCompleted);
  const pendingLessons = todaysLessons.filter((lesson: any) => !lesson.isCompleted);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
          <p className="text-gray-600">Mark lesson attendance for today</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
        <p className="text-gray-600">Mark lesson attendance for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarCheck className="text-primary" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                <p className="text-2xl font-semibold text-gray-900">{todaysLessons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarCheck className="text-secondary" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedLessons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="text-amber-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingLessons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Lessons */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Lessons</h2>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              {pendingLessons.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending lessons for today</p>
              ) : (
                pendingLessons.map((lesson: any) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed Lessons */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Completed Lessons</h2>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              {completedLessons.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No completed lessons today</p>
              ) : (
                completedLessons.map((lesson: any) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
