import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatTime(time: string): string {
  // Converts 24-hour format to 12-hour format with AM/PM
  // Input: "14:00", Output: "2:00 PM"
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour, 10);
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const formattedHour = hourNum % 12 || 12;
  return `${formattedHour}:${minute} ${ampm}`;
}

export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

export function formatDateRelative(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function isToday(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return date === today;
}

export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diff / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
  } else {
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
    } else {
      const days = Math.floor(diffHours / 24);
      if (days === 1) {
        return `Yesterday, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        return `${days} days ago`;
      }
    }
  }
}

export function getStatusColor(status: string): { bg: string; text: string; icon?: string } {
  switch (status) {
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'warning' };
    case 'approved':
    case 'accepted':
      return { bg: 'bg-green-100', text: 'text-green-800', icon: 'check_circle' };
    case 'rejected':
      return { bg: 'bg-red-100', text: 'text-red-800', icon: 'cancel' };
    case 'in_progress':
      return { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'pending' };
    default:
      return { bg: 'bg-neutral-100', text: 'text-neutral-800' };
  }
}

export function getNotificationIcon(type: string): string {
  switch (type) {
    case 'venue_change':
      return 'warning';
    case 'schedule_update':
      return 'schedule';
    case 'check_in':
      return 'check_circle';
    case 'system':
      return 'info';
    default:
      return 'notifications';
  }
}

export function getNotificationColor(type: string): string {
  switch (type) {
    case 'venue_change':
      return 'text-red-500';
    case 'schedule_update':
      return 'text-yellow-500';
    case 'check_in':
      return 'text-green-500';
    case 'system':
      return 'text-blue-500';
    default:
      return 'text-neutral-500';
  }
}
