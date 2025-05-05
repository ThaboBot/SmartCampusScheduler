import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatTime, getDayName } from "@/lib/utils";

interface TimetableClass {
  id: number;
  courseName: string;
  courseCode: string;
  department: string;
  venue: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  lecturerName: string;
}

interface TimetableData {
  user: any;
  timetable: TimetableClass[];
  terms: string[];
}

export default function TimetablePage() {
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  
  const { data, isLoading } = useQuery<TimetableData>({
    queryKey: ['/api/timetable'],
  });

  // Set default selected term when data loads
  useEffect(() => {
    if (data?.terms && data.terms.length > 0 && !selectedTerm) {
      setSelectedTerm(data.terms[0]);
    }
  }, [data, selectedTerm]);

  // Group classes by day of week
  const getClassesByDay = () => {
    if (!data?.timetable) return {};
    
    return data.timetable
      .filter(cls => !selectedTerm || cls.department === selectedTerm)
      .reduce((acc, cls) => {
        const day = cls.dayOfWeek;
        if (!acc[day]) acc[day] = [];
        acc[day].push(cls);
        return acc;
      }, {} as Record<number, TimetableClass[]>);
  };

  const classesByDay = getClassesByDay();
  const weekDays = [1, 2, 3, 4, 5]; // Monday to Friday

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
          <p className="text-muted-foreground">Failed to load timetable data</p>
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
        <title>My Timetable - CampusScheduler</title>
      </Helmet>
      <MainLayout user={data.user}>
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">My Timetable</h1>
            
            <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
              <Select
                value={selectedTerm}
                onValueChange={(value) => setSelectedTerm(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {data.terms.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <span className="material-icons mr-2 text-sm">print</span>
                Print
              </Button>
            </div>
          </div>

          <Tabs defaultValue="weekly" className="space-y-4">
            <TabsList>
              <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              <TabsTrigger value="daily">Daily View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="space-y-4">
              {weekDays.map((day) => (
                <Card key={day}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base font-medium">{getDayName(day)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!classesByDay[day] || classesByDay[day].length === 0 ? (
                      <div className="py-4 text-center text-muted-foreground">
                        No classes scheduled
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {classesByDay[day]?.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((cls) => (
                          <div key={cls.id} className="border-l-4 border-primary pl-3 py-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-foreground">{cls.courseName}</h3>
                                <p className="text-sm text-muted-foreground">{cls.courseCode} - {cls.department}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-foreground">
                                  {`${formatTime(cls.startTime)} - ${formatTime(cls.endTime)}`}
                                </p>
                                <p className="text-sm text-muted-foreground">{cls.venue}</p>
                              </div>
                            </div>
                            <p className="text-xs mt-1 text-muted-foreground">Lecturer: {cls.lecturerName}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="daily">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-foreground mb-2">Daily View Coming Soon</h3>
                    <p className="text-muted-foreground">
                      We're working on a detailed daily view that will show your classes on a time grid.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </>
  );
}
