"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { TeamSelector } from "@/components/teams/TeamSelector";
import { TeamStructure } from "@/components/teams/TeamStructure";
import type { Team } from "@/components/teams/types";

const teams: Team[] = [
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
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0]);

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
      <TeamSelector
        teams={teams}
        selectedTeam={selectedTeam}
        onSelectTeam={setSelectedTeam}
      />
      <TeamStructure team={selectedTeam} />
    </PageShell>
  );
}
