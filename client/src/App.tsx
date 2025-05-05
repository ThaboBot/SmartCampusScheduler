import { Switch, Route } from "wouter";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import TimetablePage from "@/pages/timetable";
import VenuesPage from "@/pages/venues";
import CoursesPage from "@/pages/courses";
import CheckInHistoryPage from "@/pages/check-in-history";
import ManageTimetablesPage from "@/pages/admin/manage-timetables";
import ManageVenuesPage from "@/pages/admin/manage-venues";
import UsersPage from "@/pages/admin/users";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check if user is authenticated
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    enabled: isAuthenticated,
  });

  // Check if token exists in localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated && window.location.pathname !== '/') {
    window.location.href = '/';
    return null;
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? DashboardPage : AuthPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/timetable" component={TimetablePage} />
      <Route path="/venues" component={VenuesPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/check-in-history" component={CheckInHistoryPage} />
      <Route path="/admin/manage-timetables" component={ManageTimetablesPage} />
      <Route path="/admin/manage-venues" component={ManageVenuesPage} />
      <Route path="/admin/users" component={UsersPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
