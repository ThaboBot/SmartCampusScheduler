import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Class, Notification, VenueChange } from "@shared/schema";
import MainLayout from "@/components/layouts/MainLayout";
import TodayClasses from "@/components/dashboard/TodayClasses";
import Notifications from "@/components/dashboard/Notifications";
import CampusMap from "@/components/dashboard/CampusMap";
import VenueChangeModal from "@/components/modals/VenueChangeModal";
import { formatTime } from "@/lib/utils";

interface TodayClass {
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

interface DashboardData {
  user: User;
  todayClasses: TodayClass[];
  pendingVenueChange?: VenueChange & {
    className: string;
    originalVenue: {
      id: number;
      name: string;
      capacity: number;
      location: string;
      facilities: string;
    };
    newVenue: {
      id: number;
      name: string;
      capacity: number;
      location: string;
      facilities: string;
    };
  };
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [venueChangeModalOpen, setVenueChangeModalOpen] = useState(false);
  
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  // Show venue change modal if there's a pending venue change
  useEffect(() => {
    if (data?.pendingVenueChange) {
      setVenueChangeModalOpen(true);
    }
  }, [data?.pendingVenueChange]);

  const handleCheckIn = (classId: number) => {
    // The check-in logic is in the TodayClasses component
  };

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
  };

  const handleAcceptVenueChange = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
  };

  const handleRequestDifferentVenue = () => {
    setVenueChangeModalOpen(false);
    // This could redirect to a venue selection page or show another modal
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-muted-foreground">Failed to load dashboard data</p>
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
        <title>Dashboard - CampusScheduler</title>
      </Helmet>
      <MainLayout user={data.user}>
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {data.user.firstName}!</p>
          </div>

          <TodayClasses 
            classes={data.todayClasses}
            onCheckIn={handleCheckIn}
            onRefresh={handleRefreshData}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Notifications />
            <CampusMap />
          </div>

          {/* Venue Change Modal */}
          {data.pendingVenueChange && (
            <VenueChangeModal
              open={venueChangeModalOpen}
              onOpenChange={setVenueChangeModalOpen}
              venueChange={data.pendingVenueChange}
              onAccept={handleAcceptVenueChange}
              onRequestDifferent={handleRequestDifferentVenue}
            />
          )}
        </div>
      </MainLayout>
    </>
  );
}
