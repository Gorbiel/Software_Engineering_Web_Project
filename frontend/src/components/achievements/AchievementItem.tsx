"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { ConfirmationRequestModal } from "@/components/achievements/ConfirmationRequestModal";
import { ReactionBar } from "@/components/reactions/ReactionBar";
import { EntryEditCard } from "@/components/forms/EntryEditCard";
import { EditDeleteActions } from "@/components/forms/EditDeleteActions";
import { DeleteButton } from "@/components/forms/DeleteButton";
import { useEditableEntry } from "@/hooks/useEditableEntry";
import { useIsAdmin } from "@/hooks/useIsAdmin";
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
  const {
    isEditing,
    title,
    body,
    setTitle,
    setBody,
    isPending,
    error,
    setError,
    startEditing,
    cancelEditing,
    handleSave,
    handleDelete,
  } = useEditableEntry<Achievement>({
    entityTitle: achievement.title,
    entityBody: achievement.body,
    save: (updates) => updateAchievement(achievement.id, updates),
    onChanged,
    remove: () => deleteAchievement(achievement.id),
    onDeleted: () => onDeleted(achievement.id),
    deleteConfirmMessage: "Delete this achievement? This cannot be undone.",
    deleteErrorMessage: "Unable to delete achievement.",
  });

  const [isConfirming, setIsConfirming] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const isAdmin = useIsAdmin() === true;

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
      <EntryEditCard
        title={title}
        body={body}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        titlePlaceholder="Achievement title..."
        bodyPlaceholder="Share your latest achievement..."
        error={error}
        isPending={isPending}
        onCancel={cancelEditing}
        onSave={handleSave}
      />
    );
  }

  const confirmAction = alreadyConfirmed ? (
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

  const moderationDelete =
    !isOwner && isAdmin ? (
      <DeleteButton onDelete={handleDelete} isPending={isPending} />
    ) : null;

  let actions: React.ReactNode = null;
  if (isOwner) {
    actions = (
      <>
        <button
          className="hover:text-accent-2 hover:bg-accent-2-soft flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition select-none"
          type="button"
          onClick={() => setIsRequesting(true)}
        >
          <Send className="h-4 w-4" />
        </button>
        <EditDeleteActions
          onEdit={startEditing}
          onDelete={handleDelete}
          isPending={isPending}
        />
      </>
    );
  } else if (confirmAction || moderationDelete) {
    actions = (
      <>
        {confirmAction}
        {moderationDelete}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AchievementCard
        authorName={achievement.user.name}
        authorPhotoUrl={achievement.user.profile_picture}
        authorId={achievement.user.id}
        title={achievement.title}
        date={`Shared ${formatRelativeTime(achievement.creation_date)}`}
        reactions={
          <ReactionBar
            target="achievements"
            entityId={achievement.id}
            initialReactions={achievement.reactions ?? []}
            currentUserId={currentUserId}
          />
        }
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
