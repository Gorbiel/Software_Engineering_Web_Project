import { type AdminUser } from "@/utils/admin";

type AdminUserRowProps = {
  user: AdminUser;
  isDeleting: boolean;
  onChangeRank: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
};

export function AdminUserRow({
  user,
  isDeleting,
  onChangeRank,
  onDelete,
}: AdminUserRowProps) {
  return (
    <div className="bg-background flex items-center justify-between gap-3 rounded-2xl px-4 py-2">
      <div className="flex min-w-0 flex-col">
        <span className="text-text truncate text-sm font-semibold">
          {user.name}
        </span>
        <span className="text-text-muted truncate text-xs">{user.email}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="bg-accent-2-soft text-accent-2 rounded-full px-2.5 py-1 text-xs font-semibold capitalize">
          {user.rank_name} · {user.rank}
        </span>
        <button
          type="button"
          onClick={() => onChangeRank(user)}
          className="bg-accent-2 text-primary-contrast cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition select-none hover:opacity-90"
        >
          Change rank
        </button>
        <button
          type="button"
          onClick={() => onDelete(user)}
          disabled={isDeleting}
          className="bg-accent text-primary-contrast cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition select-none hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
