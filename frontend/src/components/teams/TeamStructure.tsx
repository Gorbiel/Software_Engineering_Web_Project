import { AvatarInitials } from "@/components/misc/AvatarInitials";
import { TeamMemberCard } from "./TeamMemberCard";
import type { Team } from "./types";

export function TeamStructure({ team }: { team: Team }) {
  const lead = team.members[0];
  const members = team.members.slice(1);

  return (
    <div className="glaze-card flex flex-col gap-4">
      <h2 className="text-text text-sm font-semibold">
        Team Structure: {team.name}
      </h2>
      <div className="flex flex-col gap-4">
        <div className="bg-background flex items-center gap-4 rounded-3xl p-4">
          <AvatarInitials
            name={lead.name}
            className="text-accent bg-accent-soft h-12 w-12 text-lg font-semibold uppercase"
          />
          <div className="flex-1">
            <div className="text-text text-sm font-semibold">{lead.name}</div>
            <div className="text-text-muted mt-1 text-xs font-semibold">
              Team Lead
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {members.map((member, index) => (
            <TeamMemberCard
              key={member.name}
              name={member.name}
              role={member.role}
              colorIndex={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
