"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { TeamSelector } from "@/components/teams/TeamSelector";
import { TeamStructure } from "@/components/teams/TeamStructure";
import { TopPerformingTeamsCard } from "@/components/teams/sidebar/TopPerformingTeamsCard";
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
    <PageShell sidebar={<TopPerformingTeamsCard />}>
      <TeamSelector
        teams={teams}
        selectedTeam={selectedTeam}
        onSelectTeam={setSelectedTeam}
      />
      <TeamStructure team={selectedTeam} />
    </PageShell>
  );
}
