import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Course, Enrollment } from "@shared/schema";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search, BookOpen, Users, Calendar } from "lucide-react";

interface EnrolledCourse extends Course {
  enrolledStudents?: number;
  lecturer?: {
    name: string;
    email: string;
  };
}

export default function EnrollmentsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery<{ 
    user: User; 
    courses: EnrolledCourse[]; 
    departments: string[] 
  }>({
    queryKey: ['/api/courses'],
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await apiRequest("POST", "/api/enrollments", { courseId });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to enroll in course");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: "Enrollment successful",
        description: "You have been enrolled in the course.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: error.message,
      });
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: async (enrollmentId: number) => {
      const response = await apiRequest("DELETE", `/api/enrollments/${enrollmentId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to withdraw from course");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: "Withdrawal successful",
        description: "You have been withdrawn from the course.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Withdrawal failed",
        description: error.message,
      });
    },
  });

  if (userLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const courses = coursesData?.courses || [];
  const departments = coursesData?.departments || [];
  const enrolledCourseIds = new Set(
    courses.filter(c => c.enrolledStudents && c.enrolledStudents > 0).map(c => c.id)
  );

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || course.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const enrolledCourses = courses.filter(course => enrolledCourseIds.has(course.id));
  const availableCourses = courses.filter(course => !enrolledCourseIds.has(course.id));

  return (
    <>
      <Helmet>
        <title>Course Enrollment - CampusScheduler</title>
      </Helmet>
      <MainLayout user={user!}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Course Enrollment</h1>
            <p className="text-muted-foreground">Browse and enroll in courses for this semester</p>
          </div>

          <Tabs defaultValue="available" className="space-y-4">
            <TabsList>
              <TabsTrigger value="available">
                <BookOpen className="h-4 w-4 mr-2" />
                Available Courses ({availableCourses.length})
              </TabsTrigger>
              <TabsTrigger value="enrolled">
                <Users className="h-4 w-4 mr-2" />
                My Courses ({enrolledCourses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              {/* Search and Filter */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search courses by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={selectedDepartment || ""}
                      onChange={(e) => setSelectedDepartment(e.target.value || null)}
                      className="px-4 py-2 border rounded-md bg-background"
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Course List */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map(course => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{course.code}</CardTitle>
                          <CardDescription>{course.name}</CardDescription>
                        </div>
                        <Badge variant="outline">{course.department}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description || "No description available"}
                      </p>
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          onClick={() => enrollMutation.mutate(course.id)}
                          disabled={enrollMutation.isPending}
                        >
                          {enrollMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Enroll
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {course.lecturer?.name || "TBA"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="enrolled" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map(course => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{course.code}</CardTitle>
                          <CardDescription>{course.name}</CardDescription>
                        </div>
                        <Badge>{course.department}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description || "No description available"}
                      </p>
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const enrollment = { id: course.id }; // In real app, get actual enrollment ID
                            unenrollMutation.mutate(enrollment.id);
                          }}
                          disabled={unenrollMutation.isPending}
                        >
                          {unenrollMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Withdraw
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {course.lecturer?.email || "TBA"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {enrolledCourses.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No enrolled courses</h3>
                  <p className="text-muted-foreground">Browse available courses and enroll to get started</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </>
  );
}
