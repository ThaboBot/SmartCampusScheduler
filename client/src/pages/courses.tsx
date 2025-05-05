import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Course {
  id: number;
  name: string;
  code: string;
  department: string;
  description: string;
  enrolledStudents: number;
  lecturer: {
    name: string;
    email: string;
  };
}

interface CoursesPageData {
  user: any;
  courses: Course[];
  departments: string[];
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  
  const { data, isLoading } = useQuery<CoursesPageData>({
    queryKey: ['/api/courses'],
  });

  const filteredCourses = data?.courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || course.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const enrolledCourses = filteredCourses?.filter(course => course.enrolledStudents > 0);
  const availableCourses = filteredCourses?.filter(course => course.enrolledStudents === 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-muted-foreground">Failed to load courses data</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Courses - CampusScheduler</title>
      </Helmet>
      <MainLayout user={data.user}>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-6">Courses</h1>
          
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                <span className="material-icons">search</span>
              </span>
              <Input
                type="text"
                placeholder="Search courses by name, code or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {data.departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="enrolled" className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="enrolled">My Courses</TabsTrigger>
                <TabsTrigger value="available">Available Courses</TabsTrigger>
                <TabsTrigger value="all">All Courses</TabsTrigger>
              </TabsList>
              
              <div className="text-sm text-muted-foreground">
                {filteredCourses?.length} course{filteredCourses?.length !== 1 ? "s" : ""} found
              </div>
            </div>
            
            <TabsContent value="enrolled">
              {!enrolledCourses?.length ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <span className="material-icons text-4xl text-muted-foreground mb-2">school</span>
                    <p>You are not enrolled in any courses that match your search criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses?.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="available">
              {!availableCourses?.length ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <span className="material-icons text-4xl text-muted-foreground mb-2">school</span>
                    <p>No available courses match your search criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {availableCourses?.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all">
              {!filteredCourses?.length ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <span className="material-icons text-4xl text-muted-foreground mb-2">search_off</span>
                    <p>No courses found matching your search criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredCourses?.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </>
  );
}

interface CourseCardProps {
  course: Course;
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <Card>
      <CardHeader className="py-3 px-4 flex flex-row justify-between items-start">
        <div>
          <div className="flex items-center">
            <CardTitle className="text-base font-medium">{course.name}</CardTitle>
            <Badge variant="outline" className="ml-2">{course.code}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{course.department}</p>
        </div>
        <Badge variant={course.enrolledStudents > 0 ? "secondary" : "outline"}>
          {course.enrolledStudents > 0 ? "Enrolled" : "Not Enrolled"}
        </Badge>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-4">
          {course.description || "No description available."}
        </p>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
          <div>
            <span className="font-medium">Lecturer:</span> {course.lecturer.name}
          </div>
          <div>
            <span className="font-medium">Contact:</span> {course.lecturer.email}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
