import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import UserMenu from "@/components/ui/user-menu";
import NotificationPanel from "@/components/ui/notification-panel";
import MobileNavigation from "@/components/ui/mobile-navigation";
import { useMobile } from "@/hooks/use-mobile";
import { getInitials } from "@/lib/utils";
import { User } from "@shared/schema";

interface MainLayoutProps {
  children: ReactNode;
  user: User;
}

export default function MainLayout({ children, user }: MainLayoutProps) {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userInitials = getInitials(user.firstName, user.lastName);
  const isAdmin = user.role === "admin";

  // Menu items
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { path: "/timetable", label: "My Timetable", icon: "calendar_today" },
    { path: "/venues", label: "Venues", icon: "room" },
    { path: "/courses", label: "Courses", icon: "school" },
    { path: "/check-in-history", label: "Check-in History", icon: "history" },
  ];

  // Admin menu items
  const adminMenuItems = [
    { path: "/admin/manage-timetables", label: "Manage Timetables", icon: "edit_calendar" },
    { path: "/admin/manage-venues", label: "Manage Venues", icon: "meeting_room" },
    { path: "/admin/users", label: "Users", icon: "people" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Top Nav */}
      <nav className="bg-white border-b border-border fixed top-0 z-10 w-full">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              className="md:hidden mr-2"
              onClick={() => setShowMobileSidebar(true)}
            >
              <span className="material-icons text-neutral-700">menu</span>
            </button>
            <h1 className="text-xl font-semibold text-primary">CampusScheduler</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="relative"
              onClick={() => setShowNotifications(true)}
            >
              <span className="material-icons text-neutral-700">notifications</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </button>
            <UserMenu user={user} />
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 min-h-screen bg-white border-r border-border fixed z-10">
          <div className="p-4">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <span>{userInitials}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Links */}
            <nav>
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <a className={`flex items-center px-3 py-2 rounded-md ${
                        location === item.path 
                          ? "text-primary bg-primary/10" 
                          : "text-foreground hover:bg-accent"
                      }`}>
                        <span className="material-icons mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* Admin Section */}
            {isAdmin && (
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Admin</h3>
                <ul className="space-y-1">
                  {adminMenuItems.map((item) => (
                    <li key={item.path}>
                      <Link href={item.path}>
                        <a className={`flex items-center px-3 py-2 rounded-md ${
                          location === item.path 
                            ? "text-primary bg-primary/10" 
                            : "text-foreground hover:bg-accent"
                        }`}>
                          <span className="material-icons mr-3">{item.icon}</span>
                          <span>{item.label}</span>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-20">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileSidebar(false)}
            ></div>
            <div className="absolute top-0 left-0 h-full w-64 bg-white shadow-lg">
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-primary">Menu</h2>
                  <button onClick={() => setShowMobileSidebar(false)}>
                    <span className="material-icons text-muted-foreground">close</span>
                  </button>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                      <span>{userInitials}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{`${user.firstName} ${user.lastName}`}</p>
                      <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Navigation Links */}
                <nav>
                  <ul className="space-y-1">
                    {menuItems.map((item) => (
                      <li key={item.path}>
                        <Link href={item.path}>
                          <a className={`flex items-center px-3 py-2 rounded-md ${
                            location === item.path 
                              ? "text-primary bg-primary/10" 
                              : "text-foreground hover:bg-accent"
                          }`}>
                            <span className="material-icons mr-3">{item.icon}</span>
                            <span>{item.label}</span>
                          </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                
                {/* Mobile Admin Section */}
                {isAdmin && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Admin</h3>
                    <ul className="space-y-1">
                      {adminMenuItems.map((item) => (
                        <li key={item.path}>
                          <Link href={item.path}>
                            <a className={`flex items-center px-3 py-2 rounded-md ${
                              location === item.path 
                                ? "text-primary bg-primary/10" 
                                : "text-foreground hover:bg-accent"
                            }`}>
                              <span className="material-icons mr-3">{item.icon}</span>
                              <span>{item.label}</span>
                            </a>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-border">
                  <button 
                    className="flex items-center px-3 py-2 text-foreground hover:bg-accent rounded-md w-full"
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.location.href = '/';
                    }}
                  >
                    <span className="material-icons mr-3">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 md:ml-64">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNavigation currentPath={location} />}

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}
