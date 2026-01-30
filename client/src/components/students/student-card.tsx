import { Badge } from "@/components/ui/badge";
import { ChevronRight, Mail, Phone, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentWithPackages } from "@shared/schema";
import { useLocation } from "wouter";

interface StudentCardProps {
  student: StudentWithPackages;
  onEdit?: (student: StudentWithPackages) => void;
}

export default function StudentCard({ student, onEdit }: StudentCardProps) {
  const [, navigate] = useLocation();
  const activePackages = student.packages.filter((pkg) => pkg.isActive);
  const totalRemainingLessons = activePackages.reduce(
    (sum, pkg) => sum + pkg.remainingLessons,
    0,
  );

  const getStatusBadge = () => {
    if (totalRemainingLessons === 0) {
      return <Badge variant="destructive">No Credits</Badge>;
    } else if (totalRemainingLessons <= 3) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Low Credit</Badge>
      );
    } else {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
          {student.firstName[0]}
          {student.lastName[0]}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">
            {student.firstName} {student.lastName}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {activePackages.length > 0 && (
              <span>
                {activePackages[0].packageType} - {totalRemainingLessons}{" "}
                remaining
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
            <Mail size={12} />
            <span>{student.email}</span>
            {student.phone && (
              <>
                <Phone size={12} />
                <span>{student.phone}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {getStatusBadge()}
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(student);
            }}
            className="hover:bg-blue-50"
          >
            <Pencil size={16} className="text-blue-600" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/students/${student.id}`)}
        >
          <ChevronRight size={16} className="text-gray-400" />
        </Button>
      </div>
    </div>
  );
}
