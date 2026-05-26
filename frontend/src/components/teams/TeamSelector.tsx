"use client";

import { AvatarInitials } from "@/components/ui/AvatarInitials";
import type { Team } from "./types";

const PREVIEW_COUNT = 3;

function previewAvatarColor(index: number): string {
  const mod = index % 3;
  if (mod === 0) return "text-accent bg-accent-soft";
  if (mod === 1) return "text-accent-2 bg-accent-2-soft";
  return "text-accent-3 bg-accent-3-soft";
}

type TeamSelectorProps = {
  teams: Team[];
  selectedTeam: Team;
  onSelectTeam: (team: Team) => void;
};

export function TeamSelector({
  teams,
  selectedTeam,
  onSelectTeam,
}: TeamSelectorProps) {
  return (
    <div className="glaze-card flex flex-col gap-4">
      <h2 className="text-text text-sm font-semibold">My Teams</h2>
      <div className="flex flex-wrap gap-4">
        {teams.map((team) => {
          const isSelected = team.name === selectedTeam.name;
          const extraCount = team.members.length - PREVIEW_COUNT;
          return (
            <button
              key={team.name}
              type="button"
              onClick={() => onSelectTeam(team)}
              className={`flex w-full min-w-55 flex-none cursor-pointer flex-col gap-3 rounded-3xl border p-4 text-left transition sm:w-[calc(50%-0.5rem)] ${
                isSelected
                  ? "border-accent bg-accent-softer"
                  : "bg-background hover:border-border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-surface h-8 w-8 rounded-full" />
                  <div className="text-text font-semibold">{team.name}</div>
                </div>
              </div>
              <div className="text-text-muted text-xs font-semibold">
                Team Lead: {team.members[0].name}
              </div>
              <div className="flex items-center">
                <div className="flex items-center">
                  {team.members.slice(0, PREVIEW_COUNT).map((member, index) => (
                    <AvatarInitials
                      key={member.name}
                      name={member.name}
                      className={`h-8 w-8 text-xs font-semibold uppercase ${index === 0 ? "" : "-ml-2"} ${previewAvatarColor(index)}`}
                    />
                  ))}
                </div>
                {extraCount > 0 ? (
                  <span className="text-text-muted bg-surface -ml-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                    +{extraCount}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
