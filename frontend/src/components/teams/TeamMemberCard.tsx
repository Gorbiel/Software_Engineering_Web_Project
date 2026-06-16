import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/misc/Avatar";

function avatarColorClass(colorIndex: number): string {
  const mod = colorIndex % 3;
  if (mod === 0) return "text-accent-2 bg-accent-2-soft";
  if (mod === 1) return "text-accent-3 bg-accent-3-soft";
  return "text-accent bg-accent-soft";
}

type TeamMemberCardProps = {
  id: number | string;
  name: string;
  role: string;
  photoUrl?: string | null;
  colorIndex: number;
  onRemove?: () => void;
  removeDisabled?: boolean;
};

export function TeamMemberCard({
  id,
  name,
  role,
  photoUrl,
  colorIndex,
  onRemove,
  removeDisabled = false,
}: TeamMemberCardProps) {
  return (
    <div className="bg-background flex w-full min-w-55 flex-none items-center gap-3 rounded-3xl p-4 sm:w-[calc(50%-0.5rem)]">
      <Link
        href={`/profile/${id}`}
        className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-80"
      >
        <Avatar
          name={name}
          src={photoUrl}
          className={`text-md h-10 w-10 font-semibold uppercase ${avatarColorClass(colorIndex)}`}
        />
        <div className="min-w-0">
          <div className="text-text truncate text-sm font-semibold">{name}</div>
          <div className="text-text-muted mt-1 truncate text-xs font-semibold">
            {role}
          </div>
        </div>
      </Link>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={removeDisabled}
          aria-label={`Remove ${name}`}
          className="hover:bg-accent-softer text-accent shrink-0 cursor-pointer rounded-full p-1.5 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
