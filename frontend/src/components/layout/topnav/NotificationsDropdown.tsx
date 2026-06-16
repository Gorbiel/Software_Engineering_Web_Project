"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  getUnreadNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationIcon,
  formatNotificationTime,
  type Notification,
} from "@/utils/notifications";

const COLLAPSED_COUNT = 5;

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
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
      setNotifications(unread);
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
    if (notification.is_read) {
      return;
    }
    try {
      await markNotificationAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const visibleNotifications = showAll
    ? notifications
    : notifications.slice(0, COLLAPSED_COUNT);

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
          <span className="bg-accent absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {isOpen ? (
        <div className="glaze-card absolute top-12.5 -right-13 w-80 rounded-3xl p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-text text-sm font-semibold">
              Notifications
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-text-muted hover:text-accent hover:bg-accent-softer cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition select-none"
                >
                  Mark all as read
                </button>
              )}
              {unreadCount > 0 && (
                <span className="bg-accent-soft text-accent rounded-full px-2 py-1 text-xs font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex max-h-96 flex-col gap-2 overflow-y-auto">
            {loading ? (
              <div className="text-text-muted py-4 text-center text-sm">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-text-muted py-4 text-center text-sm">
                No new notifications
              </div>
            ) : (
              visibleNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-background hover:bg-accent-soft flex flex-col gap-1 rounded-2xl px-3 py-2 text-left transition ${
                    !notification.is_read ? "border-accent border-l-4" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {getNotificationIcon(notification.notification_type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-text block text-xs font-semibold">
                        {notification.title}
                      </span>
                      <span className="text-text-muted block truncate text-xs">
                        {notification.message}
                      </span>
                      <span className="text-text-muted mt-1 block text-[10px] uppercase">
                        {formatNotificationTime(notification.creation_date)}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > COLLAPSED_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="bg-background border-border text-text-muted hover:bg-primary hover:text-primary-contrast mt-3 w-full cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition select-none"
            >
              {showAll ? "Show less" : `Show all (${notifications.length})`}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
