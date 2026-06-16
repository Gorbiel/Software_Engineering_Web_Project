"use client";

import { useState } from "react";
import { Modal } from "@/components/misc/Modal";
import { createTeam, type TeamDetail } from "@/utils/teams";

type CreateTeamModalProps = {
  onClose: () => void;
  onCreated: (team: TeamDetail) => void;
};

export function CreateTeamModal({ onClose, onCreated }: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim() !== "" && !isPending;

  async function handleCreate() {
    if (!canSubmit) {
      return;
    }
    setError(null);
    setIsPending(true);

    try {
      const team = await createTeam(name.trim());
      onCreated(team);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the team.");
      setIsPending(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      closeDisabled={isPending}
      ariaLabel="Create new team"
      panelClassName="glaze-card flex w-full max-w-md flex-col gap-4"
    >
      <h2 className="text-text text-lg font-bold">Create new team</h2>

      <label className="flex flex-col gap-1">
        <span className="text-text-muted text-[10px] font-black uppercase">
          Team name
        </span>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Platform Engineering"
          className="border-border bg-background text-text focus:border-primary rounded-2xl border px-3 py-2 text-sm outline-none"
        />
      </label>

      {error ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-xs font-semibold">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="text-text-muted hover:text-text hover:bg-background cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={!canSubmit}
          className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating…" : "Create team"}
        </button>
      </div>
    </Modal>
  );
}
