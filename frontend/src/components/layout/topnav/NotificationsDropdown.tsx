"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import {
  getUnreadNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationLink,
  getNotificationIcon,
  formatNotificationTime,
  type Notification,
} from "@/utils/notifications";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async (showLoading = false) => {
    try {
      await Promise.resolve();
      if (showLoading) {
        setLoading(true);
      }
      const [unread, count] = await Promise.all([
        getUnreadNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(unread.slice(0, 10)); // Show only last 10
      setUnreadCount(count.count);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchNotifications();
    }, 0);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 30000);

    return () => {
      window.clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      if (ref.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className="text-accent-2 hover:bg-accent-2-soft relative cursor-pointer rounded-full p-2 transition"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {isOpen ? (
        <div className="glaze-card absolute top-12.5 -right-13 w-80 rounded-3xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text text-sm font-semibold">
              Notifications
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="bg-accent-soft text-accent rounded-full px-2 py-1 text-xs font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-accent hover:text-accent-2 text-xs font-medium mb-2 w-full text-right"
            >
              Mark all as read
            </button>
          )}

          <div className="mt-2 flex flex-col gap-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-text-muted text-center py-4 text-sm">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-text-muted text-center py-4 text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationLink(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-background hover:bg-accent-soft flex flex-col gap-1 rounded-2xl px-3 py-2 transition ${
                    !notification.is_read ? "border-l-4 border-accent" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {getNotificationIcon(notification.notification_type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-text text-xs font-semibold block">
                        {notification.title}
                      </span>
                      <span className="text-text-muted text-xs block truncate">
                        {notification.message}
                      </span>
                      <span className="text-text-muted text-[10px] uppercase block mt-1">
                        {formatNotificationTime(notification.creation_date)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <Link
              href="/notifications"
              className="text-accent hover:text-accent-2 text-xs font-medium mt-3 block text-center"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}

// Made with Bob
