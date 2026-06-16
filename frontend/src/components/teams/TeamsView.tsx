"use client";

import { useEffect, useState } from "react";
import { fetchMyTeams, type TeamDetail } from "@/utils/teams";
import { TeamSelector } from "@/components/teams/TeamSelector";
import { TeamStructure } from "@/components/teams/TeamStructure";

export function TeamsView() {
  const [teams, setTeams] = useState<TeamDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchMyTeams()
      .then((data) => {
        if (!ignore) setTeams(data);
      })
      .catch(() => {
        if (!ignore) setError("Couldn't load your teams.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (error) {
    return (
      <div className="glaze-card">
        <p className="text-text-muted text-sm">{error}</p>
      </div>
    );
  }

  if (teams === null) {
    return (
      <div className="glaze-card">
        <p className="text-text-muted text-sm">Loading teams…</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="glaze-card">
        <p className="text-text-muted text-sm">
          You are not a member of any team yet.
        </p>
      </div>
    );
  }

  const selectedTeam = teams.find((team) => team.id === selectedId) ?? teams[0];

  return (
    <>
      <TeamSelector
        teams={teams}
        selectedTeam={selectedTeam}
        onSelectTeam={(team) => setSelectedId(team.id)}
      />
      <TeamStructure team={selectedTeam} />
    </>
  );
}
