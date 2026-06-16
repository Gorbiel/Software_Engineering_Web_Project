"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { searchTeams, type TeamDetail } from "@/utils/teams";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AdminTeamRow } from "@/components/admin/AdminTeamRow";
import { CreateTeamModal } from "@/components/admin/CreateTeamModal";
import { ManageTeamModal } from "@/components/admin/ManageTeamModal";

type SearchResult = { query: string; teams: TeamDetail[] };

export function AdminManageTeamsSection() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [manageTeam, setManageTeam] = useState<TeamDetail | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed === "") {
      return;
    }

    let active = true;
    const timer = setTimeout(() => {
      searchTeams(trimmed)
        .then((teams) => {
          if (active) setResult({ query: trimmed, teams });
        })
        .catch(() => {
          if (active) setResult({ query: trimmed, teams: [] });
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [trimmed]);

  function handleTeamChanged(updated: TeamDetail) {
    setResult((prev) =>
      prev
        ? {
            ...prev,
            teams: prev.teams.map((t) => (t.id === updated.id ? updated : t)),
          }
        : prev,
    );
  }

  const matches = result && result.query === trimmed ? result.teams : null;

  return (
    <section className="glaze-card flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-text text-sm font-semibold">Manage teams</h2>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="bg-primary text-primary-contrast hover:bg-primary-strong flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold transition select-none"
        >
          <Plus className="h-4 w-4" />
          Create new team
        </button>
      </div>

      {createdName ? (
        <p className="bg-accent-2-soft text-accent-2 rounded-2xl px-4 py-2 text-xs font-semibold">
          Created team {createdName}. Search for it below to manage.
        </p>
      ) : null}

      <AdminSearchInput
        id="manage-team-search"
        label="Search team"
        placeholder="Search by team name…"
        value={query}
        onChange={(value) => {
          setCreatedName(null);
          setQuery(value);
        }}
      />

      {trimmed !== "" ? (
        <div className="flex flex-col gap-2">
          {matches === null ? (
            <p className="text-text-muted px-3 py-2 text-sm">Searching…</p>
          ) : matches.length === 0 ? (
            <p className="text-text-muted px-3 py-2 text-sm">No teams found.</p>
          ) : (
            matches.map((team) => (
              <AdminTeamRow
                key={team.id}
                team={team}
                onManage={setManageTeam}
              />
            ))
          )}
        </div>
      ) : null}

      {isCreating ? (
        <CreateTeamModal
          onClose={() => setIsCreating(false)}
          onCreated={(team) => setCreatedName(team.name)}
        />
      ) : null}

      {manageTeam ? (
        <ManageTeamModal
          team={manageTeam}
          onClose={() => setManageTeam(null)}
          onChanged={handleTeamChanged}
        />
      ) : null}
    </section>
  );
}
