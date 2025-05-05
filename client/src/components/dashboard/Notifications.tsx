import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notification } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatNotificationTime, getNotificationIcon, getNotificationColor } from "@/lib/utils";

interface NotificationsProps {
  limit?: number;
  showHeader?: boolean;
}

export default function Notifications({ limit = 3, showHeader = true }: NotificationsProps) {
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading, error } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          {showHeader && <CardTitle className="text-lg font-semibold">Recent Notifications</CardTitle>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-l-4 border-neutral-200 pl-3 py-2 animate-pulse">
                <div className="h-4 bg-neutral-100 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-neutral-100 rounded w-full mb-1"></div>
                <div className="h-3 bg-neutral-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          {showHeader && <CardTitle className="text-lg font-semibold">Recent Notifications</CardTitle>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-3">
            Error loading notifications. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayNotifications = limit ? notifications?.slice(0, limit) : notifications;

  return (
    <Card>
      <CardHeader className="pb-2">
        {showHeader && <CardTitle className="text-lg font-semibold">Recent Notifications</CardTitle>}
      </CardHeader>
      <CardContent>
        {!displayNotifications?.length ? (
          <p className="text-sm text-muted-foreground py-3">
            No notifications yet.
          </p>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-4">
              {displayNotifications?.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 pl-3 py-2 ${
                    notification.isRead ? 'border-neutral-300' : getBorderColor(notification.type)
                  } cursor-pointer hover:bg-neutral-50 transition-colors`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p className="font-medium text-foreground">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {formatNotificationTime(new Date(notification.createdAt))}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function getBorderColor(type: string): string {
  switch (type) {
    case 'venue_change':
      return 'border-red-500';
    case 'schedule_update':
      return 'border-yellow-500';
    case 'check_in':
      return 'border-green-500';
    case 'system':
      return 'border-blue-500';
    default:
      return 'border-neutral-300';
  }
}
