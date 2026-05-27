import Link from "next/link";
import { Pencil } from "lucide-react";

type ProfileHeaderProps = {
  name: string;
  subtitle?: string;
};

export function ProfileHeader({ name, subtitle }: ProfileHeaderProps) {
  return (
    <div className="glaze-card relative overflow-hidden">
      <div className="relative flex flex-col items-center gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-text text-2xl font-bold">{name}</h1>
          {subtitle ? (
            <p className="text-text-muted text-sm">{subtitle}</p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-2 md:justify-start"></div>
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
