"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, Search, Settings, User } from "lucide-react";

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

type OpenMenu = "notifications" | "avatar" | null;

export function TopNav() {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (
        notificationsRef.current?.contains(target) ||
        avatarRef.current?.contains(target)
      ) {
        return;
      }
      setOpenMenu(null);
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="border-border bg-surface/90 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-(--layout-max) items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-primary text-[32px] font-extrabold tracking-[-0.02em] transition-all select-none md:text-[48px]"
          >
            GlazedIn
          </Link>
          <div className="bg-surface-strong text-text-muted hidden items-center rounded-full px-4 py-2 transition-all select-none md:flex">
            <Search className="mr-2 h-5 w-5" />
            <input
              className="placeholder:text-text-muted w-72 bg-transparent text-sm focus:outline-none"
              placeholder="Search for a teammate..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationsRef}>
            <button
              className="text-primary hover:bg-surface-strong cursor-pointer rounded-full p-2 transition"
              type="button"
              aria-haspopup="menu"
              aria-expanded={openMenu === "notifications"}
              onClick={() =>
                setOpenMenu((current) =>
                  current === "notifications" ? null : "notifications",
                )
              }
            >
              <Bell className="h-5 w-5" />
            </button>
            {openMenu === "notifications" ? (
              <div className="glaze-card absolute top-12.5 -right-13 w-72 rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-semibold">
                    Notifications
                  </span>
                  <span className="bg-accent-soft text-accent rounded-full px-2 py-1 text-xs font-semibold">
                    3
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {notifications.map((item) => (
                    <div
                      key={item.title}
                      className="bg-surface-strong flex flex-col gap-1 rounded-2xl px-3 py-2"
                    >
                      <span className="text-text text-xs font-semibold">
                        {item.title}
                      </span>
                      <span className="text-text-muted text-xs">
                        {item.detail}
                      </span>
                      <span className="text-text-muted text-[10px] uppercase">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="relative" ref={avatarRef}>
            <button
              className="border-border bg-surface-strong hover:border-primary h-10 w-10 cursor-pointer rounded-full border transition"
              type="button"
              aria-haspopup="menu"
              aria-expanded={openMenu === "avatar"}
              onClick={() =>
                setOpenMenu((current) =>
                  current === "avatar" ? null : "avatar",
                )
              }
            />
            {openMenu === "avatar" ? (
              <div className="glaze-card absolute right-0 top-14 w-48 rounded-3xl p-3">
                <div className="flex flex-col">
                  <Link
                    href="/profile"
                    className="hover:bg-surface-strong text-text flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold"
                    onClick={() => setOpenMenu(null)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="hover:bg-surface-strong text-text flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold"
                    onClick={() => setOpenMenu(null)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    className="hover:bg-surface-strong text-text-muted flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-semibold"
                    type="button"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
