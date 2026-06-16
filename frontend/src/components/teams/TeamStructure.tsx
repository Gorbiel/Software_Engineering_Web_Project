import Link from "next/link";
import { Avatar } from "@/components/misc/Avatar";
import { TeamMemberCard } from "./TeamMemberCard";
import type { TeamDetail } from "@/utils/teams";

export function TeamStructure({ team }: { team: TeamDetail }) {
  const leaderIds = new Set(team.leaders.map((leader) => leader.id));
  const members = team.members.filter((member) => !leaderIds.has(member.id));

  return (
    <div className="glaze-card flex flex-col gap-4">
      <h2 className="text-text text-sm font-semibold">
        Team Structure: {team.name}
      </h2>
      <div className="flex flex-col gap-4">
        {team.leaders.length > 0 ? (
          <div className="flex flex-col gap-4">
            {team.leaders.map((lead) => (
              <Link
                key={lead.id}
                href={`/profile/${lead.id}`}
                className="bg-background hover:border-border flex items-center gap-4 rounded-3xl border border-transparent p-4 transition"
              >
                <Avatar
                  name={lead.name}
                  src={lead.profile_picture}
                  className="text-accent bg-accent-soft h-12 w-12 text-lg font-semibold uppercase"
                />
                <div className="flex-1">
                  <div className="text-text text-sm font-semibold">
                    {lead.name}
                  </div>
                  <div className="text-text-muted mt-1 text-xs font-semibold">
                    Team Lead
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
        {members.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {members.map((member, index) => (
              <TeamMemberCard
                key={member.id}
                id={member.id}
                name={member.name}
                role={member.job_title ?? "—"}
                photoUrl={member.profile_picture}
                colorIndex={index}
              />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm">No other members yet.</p>
        )}
      </div>
    </div>
  );
}
