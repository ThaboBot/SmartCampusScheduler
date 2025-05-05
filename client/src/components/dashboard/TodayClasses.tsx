import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ClassItem {
  id: number;
  name: string;
  department: string;
  venue: string;
  startTime: string;
  endTime: string;
  timeUntil: string;
  timeStatus: 'upcoming' | 'ongoing' | 'later' | 'venue_change';
  venueChange?: {
    id: number;
    newVenue: string;
  };
}

interface TodayClassesProps {
  classes: ClassItem[];
  onCheckIn: (classId: number) => void;
  onRefresh: () => void;
}

export default function TodayClasses({ classes, onCheckIn, onRefresh }: TodayClassesProps) {
  const [checkingIn, setCheckingIn] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCheckIn = async (classId: number) => {
    setCheckingIn(classId);
    try {
      const response = await apiRequest(
        "POST",
        "/api/check-in",
        { classId, date: new Date().toISOString().split('T')[0] }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check in");
      }

      toast({
        title: "Check-in successful",
        description: "You have successfully checked in to the class.",
      });

      onRefresh();
    } catch (error) {
      console.error("Check-in error:", error);
      toast({
        variant: "destructive",
        title: "Check-in failed",
        description: error instanceof Error ? error.message : "An error occurred during check-in",
      });
    } finally {
      setCheckingIn(null);
    }
  };

  const getStatusBadge = (timeStatus: string) => {
    switch (timeStatus) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            In 30 minutes
          </span>
        );
      case 'ongoing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Ongoing
          </span>
        );
      case 'later':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Later today
          </span>
        );
      case 'venue_change':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <span className="material-icons text-yellow-600 text-xs mr-1">warning</span>
            Venue Change Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Today's Classes</CardTitle>
          <Link href="/timetable">
            <a className="text-sm text-primary hover:text-primary/80">View all</a>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-2">No classes scheduled for today</p>
            <Link href="/timetable">
              <Button variant="outline" size="sm">View Timetable</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem) => (
              <div 
                key={classItem.id}
                className={`border-l-4 ${
                  classItem.timeStatus === 'upcoming'
                    ? 'border-primary'
                    : classItem.timeStatus === 'venue_change'
                    ? 'border-yellow-400'
                    : 'border-blue-400'
                } pl-3 py-3`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-foreground">{classItem.name}</h3>
                    <p className="text-sm text-muted-foreground">{classItem.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {`${formatTime(classItem.startTime)} - ${formatTime(classItem.endTime)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{classItem.venue}</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  {getStatusBadge(classItem.timeStatus)}
                  <Button
                    variant="outline"
                    size="sm"
                    className={`inline-flex items-center ${
                      classItem.timeStatus === 'upcoming' || classItem.timeStatus === 'ongoing'
                        ? 'text-primary border-primary hover:bg-primary/10'
                        : 'text-muted-foreground border-muted cursor-not-allowed'
                    }`}
                    onClick={() => classItem.timeStatus === 'upcoming' || classItem.timeStatus === 'ongoing' 
                      ? handleCheckIn(classItem.id) 
                      : null
                    }
                    disabled={
                      checkingIn === classItem.id ||
                      !(classItem.timeStatus === 'upcoming' || classItem.timeStatus === 'ongoing')
                    }
                  >
                    {checkingIn === classItem.id ? (
                      <>
                        <span className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                        Checking in...
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-sm mr-1">login</span>
                        Check-in
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
