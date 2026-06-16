"use client";

import { useEffect, useState } from "react";
import { useMyProfile } from "@/context/MyProfileContext";
import {
  addTeamMember,
  fetchLedTeams,
  fetchMyTeams,
  fetchTeam,
  removeTeamMember,
  type TeamDetail,
  type TeamMemberUser,
} from "@/utils/teams";
import { TeamSelector } from "@/components/teams/TeamSelector";
import { TeamStructure } from "@/components/teams/TeamStructure";

export function TeamsView() {
  const { profile } = useMyProfile();
  const currentUserId = profile?.id;
  const [teams, setTeams] = useState<TeamDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    Promise.all([fetchMyTeams(), fetchLedTeams()])
      .then(([memberTeams, ledTeams]) => {
        if (ignore) return;
        const byId = new Map<number, TeamDetail>();
        for (const team of memberTeams) byId.set(team.id, team);
        for (const team of ledTeams) {
          if (!byId.has(team.id)) byId.set(team.id, team);
        }
        setTeams(
          Array.from(byId.values()).sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
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

  const canManage =
    currentUserId !== undefined &&
    selectedTeam.leaders.some(
      (leader) => String(leader.id) === String(currentUserId),
    );

  async function applyTeamUpdate(teamId: number, action: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true);
    setManageError(null);
    try {
      await action();
      const fresh = await fetchTeam(teamId);
      setTeams((prev) =>
        prev ? prev.map((team) => (team.id === fresh.id ? fresh : team)) : prev,
      );
    } catch (err) {
      setManageError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  }

  function handleAddMember(userId: number) {
    applyTeamUpdate(selectedTeam.id, () =>
      addTeamMember(selectedTeam.id, userId),
    );
  }

  function handleRemoveMember(member: TeamMemberUser) {
    if (
      !window.confirm(`Remove ${member.name} from ${selectedTeam.name}?`)
    ) {
      return;
    }
    applyTeamUpdate(selectedTeam.id, () =>
      removeTeamMember(selectedTeam.id, member.id),
    );
  }

  return (
    <>
      <TeamSelector
        teams={teams}
        selectedTeam={selectedTeam}
        onSelectTeam={(team) => {
          setSelectedId(team.id);
          setManageError(null);
        }}
      />
      <TeamStructure
        team={selectedTeam}
        canManage={canManage}
        busy={busy}
        error={manageError}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />
    </>
  );
}
