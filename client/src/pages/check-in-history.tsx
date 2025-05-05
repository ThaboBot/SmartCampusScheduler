import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTime, formatDateRelative } from "@/lib/utils";

interface CheckIn {
  id: number;
  date: string;
  checkInTime: string;
  courseName: string;
  courseCode: string;
  venueName: string;
  status: string;
}

interface CheckInHistoryData {
  user: any;
  checkIns: CheckIn[];
  terms: string[];
  courses: Array<{ id: number; name: string; code: string }>;
}

export default function CheckInHistoryPage() {
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  
  const { data, isLoading } = useQuery<CheckInHistoryData>({
    queryKey: ['/api/check-ins/history'],
  });

  const filteredCheckIns = data?.checkIns.filter(checkIn => {
    const matchesTerm = selectedTerm === "all" || checkIn.date.startsWith(selectedTerm);
    const matchesCourse = selectedCourse === "all" || 
                          `${checkIn.courseCode} - ${checkIn.courseName}` === selectedCourse;
    return matchesTerm && matchesCourse;
  });

  const getStatusBadge = (status: string) => {
    const getClasses = () => {
      switch (status.toLowerCase()) {
        case 'on-time':
          return 'bg-green-100 text-green-800';
        case 'late':
          return 'bg-yellow-100 text-yellow-800';
        case 'missed':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-neutral-100 text-neutral-800';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClasses()}`}>
        {status}
      </span>
    );
  };

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
          <p className="text-muted-foreground">Failed to load check-in history</p>
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
        <title>Check-in History - CampusScheduler</title>
      </Helmet>
      <MainLayout user={data.user}>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-6">Check-in History</h1>
          
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2">
                  <label htmlFor="term-filter" className="block text-sm font-medium text-muted-foreground mb-1">
                    Term
                  </label>
                  <Select
                    value={selectedTerm}
                    onValueChange={setSelectedTerm}
                  >
                    <SelectTrigger id="term-filter" className="w-full">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Terms</SelectItem>
                      {data.terms.map((term) => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-1/2">
                  <label htmlFor="course-filter" className="block text-sm font-medium text-muted-foreground mb-1">
                    Course
                  </label>
                  <Select
                    value={selectedCourse}
                    onValueChange={setSelectedCourse}
                  >
                    <SelectTrigger id="course-filter" className="w-full">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {data.courses.map((course) => (
                        <SelectItem key={course.id} value={`${course.code} - ${course.name}`}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">Your Check-ins</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {filteredCheckIns?.length} record{filteredCheckIns?.length !== 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {!filteredCheckIns?.length ? (
                <div className="py-8 text-center">
                  <span className="material-icons text-4xl text-muted-foreground mb-2">history</span>
                  <p className="text-muted-foreground">No check-in records found for the selected filters.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCheckIns.map((checkIn) => (
                        <TableRow key={checkIn.id}>
                          <TableCell className="font-medium">{formatDateRelative(new Date(checkIn.date))}</TableCell>
                          <TableCell>{formatTime(checkIn.checkInTime)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{checkIn.courseName}</div>
                              <div className="text-sm text-muted-foreground">{checkIn.courseCode}</div>
                            </div>
                          </TableCell>
                          <TableCell>{checkIn.venueName}</TableCell>
                          <TableCell>{getStatusBadge(checkIn.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </>
  );
}
