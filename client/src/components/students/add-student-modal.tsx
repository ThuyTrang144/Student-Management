import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const createStudentSchema = insertStudentSchema.extend({
  packageType: z.string().min(1, "Package type is required"),
  totalLessons: z.coerce.number().min(1, "Total lessons must be at least 1"),
});

type CreateStudentForm = z.infer<typeof createStudentSchema>;

const packageOptions = [
  { value: "Piano Lessons", label: "Piano Lessons" },
  { value: "Guitar Lessons", label: "Guitar Lessons" },
  { value: "Violin Lessons", label: "Violin Lessons" },
  { value: "Drum Lessons", label: "Drum Lessons" },
  { value: "Voice Lessons", label: "Voice Lessons" },
];

const lessonOptions = [
  { value: 5, label: "5 Sessions" },
  { value: 10, label: "10 Sessions" },
  { value: 15, label: "15 Sessions" },
  { value: 20, label: "20 Sessions" },
];

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const [packageType, setPackageType] = useState("");
  const [totalLessons, setTotalLessons] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<CreateStudentForm>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      packageType: "",
      totalLessons: 10,
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: CreateStudentForm) => {
      const response = await apiRequest("POST", "/api/students", {
        student: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
        packageType: data.packageType,
        totalLessons: data.totalLessons,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      form.reset();
      setPackageType("");
      setTotalLessons("");
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateStudentForm) => {
    createStudentMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    setPackageType("");
    setTotalLessons("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder="Enter first name"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder="Enter last name"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter email address"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...form.register("phone")}
              placeholder="Enter phone number"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Lesson Package</Label>
            <Select
              value={packageType}
              onValueChange={(value) => {
                setPackageType(value);
                form.setValue("packageType", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a lesson type" />
              </SelectTrigger>
              <SelectContent>
                {packageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.packageType && (
              <p className="text-sm text-red-500">{form.formState.errors.packageType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Number of Lessons</Label>
            <Select
              value={totalLessons}
              onValueChange={(value) => {
                setTotalLessons(value);
                form.setValue("totalLessons", parseInt(value));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of lessons" />
              </SelectTrigger>
              <SelectContent>
                {lessonOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.totalLessons && (
              <p className="text-sm text-red-500">{form.formState.errors.totalLessons.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createStudentMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createStudentMutation.isPending ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
