"use client";

import { useState } from "react";
import { Modal } from "@/components/misc/Modal";
import {
  RANK_PRESETS,
  updateUserRank,
  type AdminUser,
} from "@/utils/admin";

type ChangeRankModalProps = {
  user: AdminUser;
  onClose: () => void;
  onUpdated: (rank: number, rankName: string) => void;
};

export function ChangeRankModal({
  user,
  onClose,
  onUpdated,
}: ChangeRankModalProps) {
  const [rank, setRank] = useState<number>(user.rank);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = Number.isInteger(rank) && rank >= 1 && rank <= 100;
  const canSubmit = isValid && !isPending;

  async function handleSave() {
    if (!canSubmit) {
      return;
    }
    setError(null);
    setIsPending(true);

    try {
      const result = await updateUserRank(user.id, rank);
      onUpdated(result.rank, result.rank_name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the rank.");
      setIsPending(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      closeDisabled={isPending}
      ariaLabel={`Change rank for ${user.name}`}
      panelClassName="glaze-card flex w-full max-w-md flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-text text-lg font-bold">Change rank</h2>
        <p className="text-text-muted text-sm">
          {user.name} — currently{" "}
          <span className="text-text font-semibold">
            {user.rank_name} ({user.rank})
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {RANK_PRESETS.map((preset) => {
          const active = rank === preset.value;
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => setRank(preset.value)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none ${
                active
                  ? "bg-accent-2-soft text-accent-2"
                  : "bg-background text-text-muted hover:bg-accent-2-soft"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-text-muted text-[10px] font-black uppercase">
          Custom (1–100)
        </span>
        <input
          type="number"
          min={1}
          max={100}
          value={Number.isNaN(rank) ? "" : rank}
          onChange={(event) => setRank(event.target.valueAsNumber)}
          className="border-border bg-surface text-text focus:border-primary w-28 rounded-2xl border px-3 py-2 text-sm outline-none"
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
          onClick={handleSave}
          disabled={!canSubmit}
          className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save rank"}
        </button>
      </div>
    </Modal>
  );
}
