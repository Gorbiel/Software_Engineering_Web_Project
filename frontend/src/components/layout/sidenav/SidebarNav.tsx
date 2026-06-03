"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutGrid, Users, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SidebarUserCard } from "@/components/layout/sidenav/SidebarUserCard";

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
      <SidebarUserCard />
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
