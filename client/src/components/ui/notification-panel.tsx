import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Notification } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatNotificationTime, getNotificationIcon, getNotificationColor } from "@/lib/utils";

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading } = useQuery<Notification[]>({
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

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/notifications/read-all", {});
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

  return (
    <div className="fixed inset-0 z-30">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-lg">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="flex items-center space-x-2">
            {notifications && notifications.some(n => !n.isRead) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-sm"
              >
                Mark all as read
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <span className="material-icons">close</span>
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-64px)]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border-b border-border animate-pulse">
                  <div className="flex">
                    <div className="w-6 h-6 rounded-full bg-neutral-200 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !notifications?.length ? (
            <div className="p-8 text-center">
              <span className="material-icons text-4xl text-neutral-300 mb-2">notifications_off</span>
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 border-b border-border ${!notification.isRead ? 'bg-neutral-50' : ''} cursor-pointer hover:bg-neutral-100 transition-colors`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex">
                  <span className={`material-icons ${getNotificationColor(notification.type)} mr-3`}>
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formatNotificationTime(new Date(notification.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
