import { Link } from "wouter";

interface MobileNavigationProps {
  currentPath: string;
}

export default function MobileNavigation({ currentPath }: MobileNavigationProps) {
  const navItems = [
    { path: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { path: "/timetable", icon: "calendar_today", label: "Timetable" },
    { path: "/venues", icon: "room", label: "Venues" },
    { path: "/profile", icon: "person", label: "Profile" },
  ];

  return (
    <nav className="bg-white border-t border-border fixed bottom-0 w-full">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link href={item.path} key={item.path}>
            <a className={`flex flex-col items-center py-2 ${
              currentPath === item.path 
                ? "text-primary" 
                : "text-muted-foreground"
              }`}
            >
              <span className="material-icons">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
