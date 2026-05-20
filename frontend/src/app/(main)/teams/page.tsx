"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";

const teams = [
  {
    name: "Platform Engineering",
    members: [
      { name: "Alex Rivera", role: "Team Lead" },
      { name: "Jordan Smyth", role: "Frontend Lead" },
      { name: "Marcus Chen", role: "Backend Architect" },
      { name: "Tina Lopes", role: "Platform SRE" },
      { name: "Priya Shah", role: "Infrastructure Engineer" },
      { name: "Leo Novak", role: "DevOps Specialist" },
    ],
  },
  {
    name: "Design Ops",
    members: [
      { name: "Sarah Chen", role: "Team Lead" },
      { name: "Emma Watts", role: "Product Designer" },
      { name: "Diego Park", role: "UX Researcher" },
      { name: "Maya Lee", role: "Brand Designer" },
      { name: "Nina Walsh", role: "Content Designer" },
      { name: "Omar Said", role: "Service Designer" },
      { name: "Hana Kim", role: "Design Ops Manager" },
      { name: "Luis Ortega", role: "Motion Designer" },
      { name: "Rita Gomes", role: "Accessibility Specialist" },
    ],
  },
];

export default function TeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const previewCount = 3;

  return (
    <PageShell
      sidebar={
        <div className="glaze-card flex flex-col gap-4">
          <h2 className="text-text text-sm font-semibold">
            Top Performing Teams
          </h2>
          <div className="flex flex-col gap-3">
            {["Information Security", "Quality Assurance"].map((team) => (
              <div
                key={team}
                className="bg-background flex items-center justify-between rounded-2xl px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-surface h-8 w-8 rounded-full" />
                  <div className="bg-surface h-3 w-24 rounded-full" />
                </div>
                <div className="bg-surface h-3 w-16 rounded-full" />
              </div>
            ))}
          </div>
          <button className="bg-background border-border text-text-muted hover:bg-primary hover:text-primary-contrast cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition select-none">
            View Leaderboard
          </button>
        </div>
      }
    >
      <div className="glaze-card flex flex-col gap-4">
        <h2 className="text-text text-sm font-semibold">My Teams</h2>
        <div className="flex flex-wrap gap-4">
          {teams.map((team) => {
            const isSelected = team.name === selectedTeam.name;
            return (
              <button
                key={team.name}
                type="button"
                onClick={() => setSelectedTeam(team)}
                className={`flex w-full min-w-55 flex-none flex-col gap-3 rounded-3xl border p-4 text-left transition sm:w-[calc(50%-0.5rem)] ${
                  isSelected
                    ? "border-accent bg-background"
                    : "bg-background hover:border-border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-surface h-8 w-8 rounded-full" />
                    <div className="text-text font-semibold">{team.name}</div>
                  </div>
                  {isSelected && (
                    <span className="bg-accent-soft text-accent rounded-full px-2 py-1 text-[10px] font-semibold uppercase">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-text-muted text-xs font-semibold">
                  Team Lead: {team.members[0].name}
                </div>
                <div className="flex items-center">
                  <div className="flex items-center">
                    {team.members
                      .slice(0, previewCount)
                      .map((member, index) => (
                        <div
                          key={member.name}
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold uppercase ${index === 0 ? "" : "-ml-2"} ${
                            index % 3 === 0
                              ? "text-accent bg-accent-soft"
                              : index % 3 === 1
                                ? "text-accent-2 bg-accent-2-soft"
                                : "text-accent-3 bg-accent-3-soft"
                          } `}
                        >
                          {member.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                        </div>
                      ))}
                  </div>
                  {team.members.length > previewCount ? (
                    <span className="text-text-muted bg-surface -ml-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                      +{team.members.length - previewCount}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="glaze-card flex flex-col gap-4">
        <h2 className="text-text text-sm font-semibold">
          Team Structure: {selectedTeam.name}
        </h2>
        <div className="flex flex-col gap-4">
          <div className="bg-background flex items-center gap-4 rounded-3xl p-4">
            <div className="text-accent bg-accent-soft flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold uppercase">
              {selectedTeam.members[0].name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <div className="flex-1">
              <div className="text-text text-sm font-semibold">
                {selectedTeam.members[0].name}
              </div>
              <div className="text-text-muted mt-1 text-xs font-semibold">
                Team Lead
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {selectedTeam.members.slice(1).map((member, index) => (
              <div
                key={member.name}
                className="bg-background flex w-full min-w-55 flex-none items-center gap-3 rounded-3xl p-4 sm:w-[calc(50%-0.5rem)]"
              >
                <div
                  key={member.name}
                  className={`text-md flex h-10 w-10 items-center justify-center rounded-full font-semibold uppercase ${
                    index % 3 === 0
                      ? "text-accent-2 bg-accent-2-soft"
                      : index % 3 === 1
                        ? "text-accent-3 bg-accent-3-soft"
                        : "text-accent bg-accent-soft"
                  } `}
                >
                  {member.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-text text-sm font-semibold">
                    {member.name}
                  </div>
                  <div className="text-text-muted mt-1 text-xs font-semibold">
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
