import { apiJson } from "./api";

export interface Notification {
  id: number;
  recipient: number;
  sender: {
    id: number;
    name: string;
    email: string;
    profile_picture: string | null;
  } | null;
  notification_type: string;
  title: string;
  message: string;
  achievement: number | null;
  glaze: number | null;
  is_read: boolean;
  creation_date: string;
  read_date: string | null;
}

export interface NotificationCount {
  count: number;
}

export async function getNotifications(): Promise<Notification[]> {
  return apiJson<Notification[]>("/notifications/");
}

export async function getUnreadNotifications(): Promise<Notification[]> {
  return apiJson<Notification[]>("/notifications/unread/");
}

export async function getUnreadCount(): Promise<NotificationCount> {
  return apiJson<NotificationCount>("/notifications/unread_count/");
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  return apiJson<Notification>(`/notifications/${id}/mark_read/`, {
    method: "POST",
  });
}

export async function markAllNotificationsAsRead(
  notificationIds?: number[]
): Promise<{ marked_read: number; message: string }> {
  return apiJson("/notifications/mark_all_read/", {
    method: "POST",
    body: JSON.stringify({ notification_ids: notificationIds }),
  });
}

export async function clearReadNotifications(): Promise<{
  deleted: number;
  message: string;
}> {
  return apiJson("/notifications/clear_read/", {
    method: "DELETE",
  });
}

export function getNotificationLink(notification: Notification): string {
  switch (notification.notification_type) {
    case "achievement_created":
    case "achievement_confirmed":
    case "achievement_reaction":
    case "confirmation_request":
      return notification.achievement
        ? `/achievements/${notification.achievement}`
        : "/";
    case "glaze_received":
    case "glaze_reaction":
      return notification.glaze ? `/glazes/${notification.glaze}` : "/";
    default:
      return "/";
  }
}

export function getNotificationIcon(type: string): string {
  switch (type) {
    case "achievement_created":
      return "🎯";
    case "achievement_confirmed":
      return "✅";
    case "achievement_reaction":
      return "❤️";
    case "glaze_received":
      return "🌟";
    case "glaze_reaction":
      return "👍";
    case "confirmation_request":
      return "🔔";
    case "mention":
      return "💬";
    default:
      return "📢";
  }
}

export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Made with Bob
