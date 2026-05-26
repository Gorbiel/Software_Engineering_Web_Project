import Link from "next/link";
import { Search } from "lucide-react";
import { NotificationsDropdown } from "@/components/topnav/NotificationsDropdown";
import { AvatarDropdown } from "@/components/topnav/AvatarDropdown";

export function TopNav() {
  return (
    <header className="border-border bg-surface sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-(--layout-max) items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-primary text-[32px] font-extrabold tracking-[-0.02em] transition-all select-none md:text-[48px]"
          >
            GlazedIn
          </Link>
          <div className="bg-background text-text-muted hidden items-center rounded-full px-4 py-2 transition-all select-none md:flex">
            <input
              className="placeholder:text-text-muted w-72 bg-transparent text-sm focus:outline-none"
              placeholder="Search for a teammate..."
              type="text"
            />
            <button
              className="text-accent-2 hover:bg-background cursor-pointer rounded-full transition"
              type="button"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationsDropdown />
          <AvatarDropdown />
        </div>
      </div>
    </header>
  );
}
