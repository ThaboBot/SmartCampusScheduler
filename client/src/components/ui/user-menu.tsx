import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center"
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Avatar className="h-8 w-8 bg-primary">
          <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
        </Avatar>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-border">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium">{`${user.firstName} ${user.lastName}`}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Link href="/profile">
            <a className="block px-4 py-2 text-sm text-foreground hover:bg-accent">Profile</a>
          </Link>
          <Link href="/settings">
            <a className="block px-4 py-2 text-sm text-foreground hover:bg-accent">Settings</a>
          </Link>
          <button 
            className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
