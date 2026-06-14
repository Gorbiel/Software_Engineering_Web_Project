"use client";

import { useState } from "react";
import { Check, Pencil, Send, Trash2 } from "lucide-react";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { ConfirmationRequestModal } from "@/components/achievements/ConfirmationRequestModal";
import {
  type Achievement,
  confirmAchievement,
  deleteAchievement,
  updateAchievement,
} from "@/utils/achievements";
import { formatRelativeTime } from "@/utils/date";

type AchievementItemProps = {
  achievement: Achievement;
  currentUserId: number | string | undefined;
  onChanged: (achievement: Achievement) => void;
  onDeleted: (id: number) => void;
};

export function AchievementItem({
  achievement,
  currentUserId,
  onChanged,
  onDeleted,
}: AchievementItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(achievement.title);
  const [body, setBody] = useState(achievement.body);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner =
    currentUserId !== undefined &&
    String(achievement.user.id) === String(currentUserId);

  const alreadyConfirmed =
    currentUserId !== undefined &&
    achievement.confirmations.some(
      (c) => String(c.user.id) === String(currentUserId),
    );

  const canConfirm =
    currentUserId !== undefined && !isOwner && !alreadyConfirmed;

  const confirmedBy = achievement.confirmations.map((c) => ({
    name: c.user.name,
    src: c.user.profile_picture,
  }));

  function startEditing() {
    setTitle(achievement.title);
    setBody(achievement.body);
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
      const updated = await updateAchievement(achievement.id, {
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
    if (!window.confirm("Delete this achievement? This cannot be undone.")) {
      return;
    }
    setError(null);
    setIsPending(true);

    try {
      await deleteAchievement(achievement.id);
      onDeleted(achievement.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete achievement.",
      );
      setIsPending(false);
    }
  }

  async function handleConfirm() {
    if (!canConfirm || isConfirming) {
      return;
    }
    setError(null);
    setIsConfirming(true);

    try {
      const confirmation = await confirmAchievement(achievement.id);
      onChanged({
        ...achievement,
        confirmations: [...achievement.confirmations, confirmation],
        confirmation_count: achievement.confirmation_count + 1,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to confirm achievement.",
      );
    } finally {
      setIsConfirming(false);
    }
  }

  if (isEditing) {
    return (
      <div className="glaze-card flex flex-col gap-4">
        <input
          className="bg-background placeholder:text-text-muted text-text rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none"
          placeholder="Achievement title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="bg-background h-28 rounded-2xl px-4 py-3">
          <textarea
            className="placeholder:text-text-muted h-full w-full resize-none bg-transparent text-sm focus:outline-none"
            placeholder="Share your latest achievement..."
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
        onClick={() => setIsRequesting(true)}
      >
        <Send className="h-4 w-4" />
      </button>
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
  ) : alreadyConfirmed ? (
    <span className="text-accent-2 flex items-center gap-1 px-2 py-1 font-semibold">
      <Check className="h-4 w-4" />
      Confirmed
    </span>
  ) : canConfirm ? (
    <button
      className="text-accent-2 hover:bg-accent-2-soft flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
      type="button"
      onClick={handleConfirm}
      disabled={isConfirming}
    >
      <Check className="h-4 w-4" />
      {isConfirming ? "Confirming…" : "Confirm"}
    </button>
  ) : null;

  return (
    <div className="flex flex-col gap-2">
      <AchievementCard
        authorName={achievement.user.name}
        authorPhotoUrl={achievement.user.profile_picture}
        authorId={achievement.user.id}
        title={achievement.title}
        date={`Shared ${formatRelativeTime(achievement.creation_date)}`}
        likes={0}
        comments={0}
        confirmedBy={confirmedBy}
        actions={actions}
      >
        {achievement.body}
      </AchievementCard>
      {error ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-2 text-xs font-semibold">
          {error}
        </p>
      ) : null}
      {isRequesting ? (
        <ConfirmationRequestModal
          achievementId={achievement.id}
          onClose={() => setIsRequesting(false)}
        />
      ) : null}
    </div>
  );
}
