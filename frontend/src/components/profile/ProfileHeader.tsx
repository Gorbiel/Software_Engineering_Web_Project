import Link from "next/link";
import { Pencil } from "lucide-react";

type ProfileHeaderProps = {
  name: string;
  subtitle?: string;
  bio?: string;
};

export function ProfileHeader({ name, subtitle, bio }: ProfileHeaderProps) {
  return (
    <div className="glaze-card relative overflow-hidden">
      <div className="relative flex flex-col items-center gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3 text-center md:text-left">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-text text-2xl font-bold">{name}</h1>
            {subtitle ? (
              <p className="text-text text-sm font-semibold">{subtitle}</p>
            ) : null}
          </div>
          {bio ? (
            <p className="text-text-muted border-border max-w-2xl border-t pt-3 text-sm leading-relaxed wrap-break-word">
              {bio}
            </p>
          ) : null}
        </div>

        <div>
          <Link
            href="/settings"
            className="bg-primary text-primary-contrast hover:bg-primary-strong flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition select-none"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
