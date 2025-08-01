import { useQuery } from "@tanstack/react-query";
import { Users, CalendarCheck, Clock, TrendingUp, Plus, Check, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import AddStudentModal from "@/components/students/add-student-modal";
import StudentCard from "@/components/students/student-card";
import LessonCard from "@/components/attendance/lesson-card";
import type { StudentWithPackages } from "@shared/schema";

export default function Dashboard() {
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<StudentWithPackages[]>({
    queryKey: ["/api/students"],
  });

  const { data: todaysLessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ["/api/lessons/today"],
  });

  const recentStudents = students.slice(0, 3);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (statsLoading || studentsLoading || lessonsLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your students and track lesson attendance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Manage your students and track lesson attendance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-primary text-xl" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalStudents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarCheck className="text-secondary text-xl" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Lessons</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.todaysLessons || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="text-amber-600 text-xl" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Attendance</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.pendingAttendance || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600 text-xl" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.completionRate || "0%"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Search */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Search</h2>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search students, lessons, or packages..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:w-80">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={() => setIsAddStudentOpen(true)}
                >
                  <Plus className="mr-2" size={16} />
                  Add New Student
                </Button>
                <Button 
                  className="w-full bg-secondary hover:bg-secondary/90"
                  onClick={() => window.location.href = '/attendance'}
                >
                  <Check className="mr-2" size={16} />
                  Mark Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Students & Upcoming Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Students</h2>
              <Button variant="link" className="text-primary p-0" onClick={() => window.location.href = '/students'}>
                View All
              </Button>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentStudents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No students found</p>
              ) : (
                recentStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              <Button variant="link" className="text-primary p-0" onClick={() => window.location.href = '/attendance'}>
                View Schedule
              </Button>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              {todaysLessons.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No lessons scheduled for today</p>
              ) : (
                todaysLessons.map((lesson: any) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddStudentModal 
        isOpen={isAddStudentOpen} 
        onClose={() => setIsAddStudentOpen(false)} 
      />
    </div>
  );
}
