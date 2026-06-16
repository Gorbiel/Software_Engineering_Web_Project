"use client";

import { useState } from "react";
import { Modal } from "@/components/misc/Modal";
import { SearchSelect } from "@/components/reports/SearchSelect";
import { TeamMemberManageRow } from "@/components/admin/TeamMemberManageRow";
import { searchUserOptions } from "@/utils/userSearchOptions";
import {
  addTeamLeader,
  addTeamMember,
  fetchTeam,
  removeTeamLeader,
  removeTeamMember,
  type TeamDetail,
} from "@/utils/teams";

type ManageTeamModalProps = {
  team: TeamDetail;
  onClose: () => void;
  onChanged: (team: TeamDetail) => void;
};

export function ManageTeamModal({
  team: initialTeam,
  onClose,
  onChanged,
}: ManageTeamModalProps) {
  const [team, setTeam] = useState<TeamDetail>(initialTeam);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leader = team.leaders[0] ?? null;

  async function run(action: () => Promise<unknown>) {
    if (isPending) {
      return;
    }
    setIsPending(true);
    setError(null);
    try {
      await action();
      const fresh = await fetchTeam(team.id);
      setTeam(fresh);
      onChanged(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      closeDisabled={isPending}
      ariaLabel={`Manage ${team.name}`}
      panelClassName="glaze-card flex max-h-[85vh] w-full max-w-lg flex-col gap-5 overflow-y-auto"
    >
      <h2 className="text-text text-lg font-bold">Manage {team.name}</h2>

      {error ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-xs font-semibold">
          {error}
        </p>
      ) : null}

      <section className="flex flex-col gap-2">
        <h3 className="text-text-muted text-[10px] font-black uppercase">
          Team leader
        </h3>
        {leader ? (
          <TeamMemberManageRow
            user={leader}
            disabled={isPending}
            onRemove={() => run(() => removeTeamLeader(team.id, leader.id))}
          />
        ) : (
          <SearchSelect
            placeholder="Search a user to set as leader…"
            search={searchUserOptions}
            selected={null}
            onClear={() => {}}
            onSelect={(option) => run(() => addTeamLeader(team.id, option.id))}
          />
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-text-muted text-[10px] font-black uppercase">
          Members
        </h3>
        <SearchSelect
          placeholder="Search a user to add…"
          search={searchUserOptions}
          selected={null}
          onClear={() => {}}
          onSelect={(option) => run(() => addTeamMember(team.id, option.id))}
        />
        {team.members.length > 0 ? (
          <div className="flex flex-col gap-2">
            {team.members.map((member) => (
              <TeamMemberManageRow
                key={member.id}
                user={member}
                disabled={isPending}
                onRemove={() => run(() => removeTeamMember(team.id, member.id))}
              />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm">No members yet.</p>
        )}
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
