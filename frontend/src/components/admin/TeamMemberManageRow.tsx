import { X } from "lucide-react";
import { type TeamMemberUser } from "@/utils/teams";

type TeamMemberManageRowProps = {
  user: TeamMemberUser;
  disabled: boolean;
  onRemove: () => void;
};

export function TeamMemberManageRow({
  user,
  disabled,
  onRemove,
}: TeamMemberManageRowProps) {
  return (
    <div className="bg-background flex items-center justify-between gap-3 rounded-2xl px-4 py-2">
      <div className="flex min-w-0 flex-col">
        <span className="text-text truncate text-sm font-semibold">
          {user.name}
        </span>
        <span className="text-text-muted truncate text-xs">{user.email}</span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${user.name}`}
        className="hover:bg-accent-softer text-accent shrink-0 cursor-pointer rounded-full p-1.5 transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
