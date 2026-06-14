import Link from "next/link";
import { Pencil } from "lucide-react";
import { Avatar } from "@/components/misc/Avatar";

type ProfileHeaderProps = {
  name: string;
  subtitle?: string;
  bio?: string;
  editable?: boolean;
  photoUrl?: string | null;
};

export function ProfileHeader({
  name,
  subtitle,
  bio,
  editable = true,
  photoUrl,
}: ProfileHeaderProps) {
  return (
    <div className="glaze-card relative overflow-hidden">
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:gap-5 md:text-left">
          {photoUrl !== undefined ? (
            <Avatar
              name={name}
              src={photoUrl}
              className="bg-accent-2-soft text-accent-2 h-16 w-16 shrink-0 text-lg font-bold"
            />
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h1 className="text-text text-2xl font-bold">{name}</h1>
            {subtitle ? (
              <p className="text-text text-sm font-semibold">{subtitle}</p>
            ) : null}
          </div>

          {editable ? (
            <div>
              <Link
                href="/settings"
                className="bg-primary text-primary-contrast hover:bg-primary-strong flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition select-none"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Link>
            </div>
          ) : null}
        </div>

        {bio ? (
          <p className="text-text-muted border-border border-t pt-3 text-sm leading-relaxed wrap-break-word">
            {bio}
          </p>
        ) : null}
      </div>
    </div>
  );
}
