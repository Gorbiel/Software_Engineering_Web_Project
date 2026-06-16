"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BarChart3, LogOut, Settings, Shield, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/context/MyProfileContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useLedTeams } from "@/hooks/useLedTeams";
import { Avatar } from "@/components/misc/Avatar";

export function AvatarDropdown() {
  const { user, logout } = useAuth();
  const { profile } = useMyProfile();
  const isAdmin = useIsAdmin();
  const ledTeams = useLedTeams();
  const showReports = isAdmin === true || (ledTeams?.length ?? 0) > 0;
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  async function handleLogout() {
    setIsLoggingOut(true);
    setIsOpen(false);
    await logout();
  }

  const photoUrl = profile?.profile_picture ?? null;
  const name = user?.name ?? "Profile";

  return (
    <div className="relative" ref={ref}>
      <button
        className="border-border bg-background hover:border-primary text-text-muted relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border text-xs font-bold transition select-none"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Avatar
          name={name}
          src={photoUrl}
          className="h-full w-full bg-background text-xs font-bold"
        />
      </button>
      {isOpen ? (
        <div className="glaze-card absolute top-14 right-0 w-48 rounded-3xl p-3">
          <div className="flex flex-col">
            <Link
              href="/profile"
              className="hover:bg-background text-text flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            {showReports ? (
              <Link
                href="/reports"
                className="hover:bg-background text-text flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold"
                onClick={() => setIsOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />
                Reports
              </Link>
            ) : null}
            {isAdmin ? (
              <Link
                href="/admin"
                className="hover:bg-background text-text flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="h-4 w-4" />
                Admin panel
              </Link>
            ) : null}
            <Link
              href="/settings"
              className="hover:bg-background text-text flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              className="hover:bg-background text-text flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold disabled:opacity-50"
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
