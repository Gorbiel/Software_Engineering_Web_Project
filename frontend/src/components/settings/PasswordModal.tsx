"use client";

import { useState } from "react";
import { Modal } from "@/components/misc/Modal";

export type PasswordValues = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

type PasswordModalProps = {
  title: string;
  requireCurrent: boolean;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (values: PasswordValues) => Promise<unknown>;
};

function PasswordField({
  label,
  value,
  onChange,
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-text-muted text-[10px] font-black uppercase">
        {label}
      </span>
      <input
        type="password"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        className="border-border bg-background text-text focus:border-primary rounded-2xl border px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}

export function PasswordModal({
  title,
  requireCurrent,
  submitLabel = "Confirm",
  onClose,
  onSubmit,
}: PasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirmation.length > 0 && newPassword !== confirmation;
  const canSubmit =
    newPassword.trim() !== "" &&
    confirmation.trim() !== "" &&
    newPassword === confirmation &&
    (!requireCurrent || currentPassword.trim() !== "") &&
    !isPending;

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    setError(null);
    setIsPending(true);
    try {
      await onSubmit({
        currentPassword,
        newPassword,
        newPasswordConfirmation: confirmation,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't change the password.",
      );
      setIsPending(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      closeDisabled={isPending}
      ariaLabel={title}
      panelClassName="glaze-card flex w-full max-w-md flex-col gap-4"
    >
      <h2 className="text-text text-lg font-bold">{title}</h2>

      {requireCurrent ? (
        <PasswordField
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoFocus
        />
      ) : null}
      <PasswordField
        label="New password"
        value={newPassword}
        onChange={setNewPassword}
        autoFocus={!requireCurrent}
      />
      <PasswordField
        label="Confirm new password"
        value={confirmation}
        onChange={setConfirmation}
      />

      {mismatch ? (
        <p className="text-accent text-xs font-semibold">
          Passwords do not match.
        </p>
      ) : null}

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
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </Modal>
  );
}
