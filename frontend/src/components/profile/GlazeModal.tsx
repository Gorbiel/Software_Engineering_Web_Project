"use client";

import { useEffect, useState } from "react";
import { createGlaze } from "@/utils/glazes";

type GlazeModalProps = {
  receivingUserId: number | string;
  receivingUserName: string;
  onClose: () => void;
  onCreated?: () => void;
};

export function GlazeModal({
  receivingUserId,
  receivingUserName,
  onClose,
  onCreated,
}: GlazeModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const canSubmit = title.trim() !== "" && body.trim() !== "" && !isPending;

  function cleanup() {
    setTitle("");
    setBody("");
    setError(null);
    setIsPending(false);
  }

  function handleCancel() {
    cleanup();
    onClose();
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        handleCancel();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    setError(null);
    setIsPending(true);

    try {
      await createGlaze({
        receivingUserId,
        title: title.trim(),
        body: body.trim(),
      });
      onCreated?.();
      cleanup();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send glaze.");
      setIsPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Glaze ${receivingUserName}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          handleCancel();
        }
      }}
    >
      <div className="glaze-card flex w-full max-w-md flex-col gap-4">
        <h2 className="text-text text-lg font-bold">
          Glaze {receivingUserName}
        </h2>

        <input
          className="bg-background placeholder:text-text-muted text-text rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none"
          placeholder="Glaze title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div className="bg-background h-28 rounded-2xl px-4 py-3">
          <textarea
            className="placeholder:text-text-muted h-full w-full resize-none bg-transparent text-sm focus:outline-none"
            placeholder={`Tell everyone why ${receivingUserName} deserves a glaze...`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {error ? (
          <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-xs font-semibold">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <button
            className="text-text-muted hover:text-text hover:bg-background cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="bg-primary text-primary-contrast hover:bg-primary-strong flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isPending ? "Glazing…" : "Glaze"}
          </button>
        </div>
      </div>
    </div>
  );
}
