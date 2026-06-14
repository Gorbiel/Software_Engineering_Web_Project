"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { GlazeCard } from "@/components/glazes/GlazeCard";
import { type Glaze, deleteGlaze, updateGlaze } from "@/utils/glazes";
import { formatRelativeTime } from "@/utils/date";

type GlazeItemProps = {
  glaze: Glaze;
  currentUserId: number | string | undefined;
  onChanged: (glaze: Glaze) => void;
  onDeleted: (id: number) => void;
};

export function GlazeItem({
  glaze,
  currentUserId,
  onChanged,
  onDeleted,
}: GlazeItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(glaze.title);
  const [body, setBody] = useState(glaze.body);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner =
    currentUserId !== undefined &&
    String(glaze.posting_user.id) === String(currentUserId);

  function startEditing() {
    setTitle(glaze.title);
    setBody(glaze.body);
    setError(null);
    setIsEditing(true);
  }

  async function handleSave() {
    if (title.trim() === "" || body.trim() === "" || isPending) {
      return;
    }
    setError(null);
    setIsPending(true);

    try {
      const updated = await updateGlaze(glaze.id, {
        title: title.trim(),
        body: body.trim(),
      });
      onChanged(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    if (isPending) {
      return;
    }
    if (!window.confirm("Delete this glaze? This cannot be undone.")) {
      return;
    }
    setError(null);
    setIsPending(true);

    try {
      await deleteGlaze(glaze.id);
      onDeleted(glaze.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete glaze.");
      setIsPending(false);
    }
  }

  if (isEditing) {
    return (
      <div className="glaze-card flex flex-col gap-4">
        <input
          className="bg-background placeholder:text-text-muted text-text rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none"
          placeholder="Glaze title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="bg-background h-28 rounded-2xl px-4 py-3">
          <textarea
            className="placeholder:text-text-muted h-full w-full resize-none bg-transparent text-sm focus:outline-none"
            placeholder="Share why they deserve a glaze..."
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
            className="text-text-muted hover:text-text hover:bg-background cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none"
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={handleSave}
            disabled={isPending || title.trim() === "" || body.trim() === ""}
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    );
  }

  const actions = isOwner ? (
    <>
      <button
        className="hover:text-accent-2 hover:bg-accent-2-soft flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition select-none"
        type="button"
        onClick={startEditing}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        className="hover:text-accent hover:bg-accent-softer flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition select-none disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  ) : null;

  return (
    <div className="flex flex-col gap-2">
      <GlazeCard
        posterName={glaze.posting_user.name}
        posterPhotoUrl={glaze.posting_user.profile_picture}
        posterId={glaze.posting_user.id}
        receiverName={glaze.receiving_user.name}
        receiverId={glaze.receiving_user.id}
        title={glaze.title}
        date={`Glazed ${formatRelativeTime(glaze.creation_date)}`}
        actions={actions}
      >
        {glaze.body}
      </GlazeCard>
      {error ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-xs font-semibold">
          {error}
        </p>
      ) : null}
    </div>
  );
}
