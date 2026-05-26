"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutGrid, Users, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AvatarInitials } from "@/components/misc/AvatarInitials";

const navItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "Feed", icon: LayoutGrid },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/leaderboards", label: "Leaderboards", icon: BarChart3 },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export function SidebarNav({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayName = user?.name ?? "Alex Baker";

  if (variant === "mobile") {
    return (
      <nav className="bg-surface flex items-center justify-between gap-2 rounded-full px-4 py-2 shadow-sm">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm transition ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-text-muted hover:bg-background"
              }`}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-2">
      <div className="glaze-card mb-5 flex flex-col items-center gap-3 text-center">
        <AvatarInitials
          name={displayName}
          className="bg-background text-accent border-surface h-28 w-28 overflow-hidden border-4 text-2xl font-black"
        />
        <div className="flex flex-col gap-1">
          <p className="text-text text-base font-semibold">
            {user?.name || "User Name"}
          </p>
          <p className="text-text-muted text-xs font-semibold">Rank: ---</p>
        </div>
        <div className="w-full">
          <div className="bg-background h-2 w-full rounded-full">
            <div className="bg-accent h-full w-2/3 rounded-full" />
          </div>
          <p className="text-accent mt-2 text-xs font-semibold">
            Progress to next rank
          </p>
        </div>
      </div>
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition select-none ${
              active
                ? "bg-accent-soft text-accent"
                : "text-text-muted hover:bg-background"
            }`}
          >
            <item.icon
              className={`h-5 w-5 ${active ? "text-accent" : "text-text-muted"}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
