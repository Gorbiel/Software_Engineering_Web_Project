import { type TeamDetail } from "@/utils/teams";

type AdminTeamRowProps = {
  team: TeamDetail;
  onManage: (team: TeamDetail) => void;
};

export function AdminTeamRow({ team, onManage }: AdminTeamRowProps) {
  const leader = team.leaders[0];
  return (
    <div className="bg-background flex items-center justify-between gap-3 rounded-2xl px-4 py-2">
      <div className="flex min-w-0 flex-col">
        <span className="text-text truncate text-sm font-semibold">
          {team.name}
        </span>
        <span className="text-text-muted truncate text-xs">
          {team.members.length}{" "}
          {team.members.length === 1 ? "member" : "members"}
          {leader ? ` · led by ${leader.name}` : ""}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onManage(team)}
        className="bg-accent-2 text-primary-contrast shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition select-none hover:opacity-90"
      >
        Manage team
      </button>
    </div>
  );
}
