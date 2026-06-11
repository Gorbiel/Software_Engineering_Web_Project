import Link from "next/link";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { AvatarDropdown } from "./AvatarDropdown";
import { UserSearch } from "./UserSearch";

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
          <UserSearch />
        </div>
        <div className="flex items-center gap-3">
          <NotificationsDropdown />
          <AvatarDropdown />
        </div>
      </div>
    </header>
  );
}
