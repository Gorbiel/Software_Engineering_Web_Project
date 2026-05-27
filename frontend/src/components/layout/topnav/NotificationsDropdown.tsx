"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

const notifications = [
  {
    title: "New confirmation request",
    detail: "Refactored API migration",
    time: "2m ago",
  },
  {
    title: "Shout-out received",
    detail: "Design system revamp",
    time: "1h ago",
  },
  {
    title: "Leaderboard update",
    detail: "You moved to #3",
    time: "Today",
  },
];

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      if (ref.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="text-accent-2 hover:bg-accent-2-soft cursor-pointer rounded-full p-2 transition"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Bell className="h-5 w-5" />
      </button>
      {isOpen ? (
        <div className="glaze-card absolute top-12.5 -right-13 w-72 rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-text text-sm font-semibold">
              Notifications
            </span>
            <span className="bg-accent-soft text-accent rounded-full px-2 py-1 text-xs font-semibold">
              {notifications.length}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {notifications.map((item) => (
              <div
                key={item.title}
                className="bg-background flex flex-col gap-1 rounded-2xl px-3 py-2"
              >
                <span className="text-text text-xs font-semibold">
                  {item.title}
                </span>
                <span className="text-text-muted text-xs">{item.detail}</span>
                <span className="text-text-muted text-[10px] uppercase">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
