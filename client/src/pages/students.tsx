import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import AddStudentModal from "@/components/students/add-student-modal";
import StudentCard from "@/components/students/student-card";
import type { StudentWithPackages } from "@shared/schema";

export default function Students() {
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: students = [], isLoading } = useQuery<StudentWithPackages[]>({
    queryKey: ["/api/students"],
  });

  const filteredStudents = students.filter(student => 
    searchQuery === "" || 
    student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
            <p className="text-gray-600">Manage your student roster and lesson packages</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage your student roster and lesson packages</p>
        </div>
        <Button onClick={() => setIsAddStudentOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2" size={16} />
          Add Student
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">
                  {searchQuery ? "No students found matching your search." : "No students added yet."}
                </p>
                {!searchQuery && (
                  <Button 
                    className="mt-4 bg-primary hover:bg-primary/90" 
                    onClick={() => setIsAddStudentOpen(true)}
                  >
                    <Plus className="mr-2" size={16} />
                    Add Your First Student
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <StudentCard student={student} />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AddStudentModal 
        isOpen={isAddStudentOpen} 
        onClose={() => setIsAddStudentOpen(false)} 
      />
    </div>
  );
}
