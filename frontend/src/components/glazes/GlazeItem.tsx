"use client";

import { GlazeCard } from "@/components/glazes/GlazeCard";
import { ReactionBar } from "@/components/reactions/ReactionBar";
import { EntryEditCard } from "@/components/forms/EntryEditCard";
import { EditDeleteActions } from "@/components/forms/EditDeleteActions";
import { DeleteButton } from "@/components/forms/DeleteButton";
import { useEditableEntry } from "@/hooks/useEditableEntry";
import { useIsAdmin } from "@/hooks/useIsAdmin";
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
  const {
    isEditing,
    title,
    body,
    setTitle,
    setBody,
    isPending,
    error,
    startEditing,
    cancelEditing,
    handleSave,
    handleDelete,
  } = useEditableEntry<Glaze>({
    entityTitle: glaze.title,
    entityBody: glaze.body,
    save: (updates) => updateGlaze(glaze.id, updates),
    onChanged,
    remove: () => deleteGlaze(glaze.id),
    onDeleted: () => onDeleted(glaze.id),
    deleteConfirmMessage: "Delete this glaze? This cannot be undone.",
    deleteErrorMessage: "Unable to delete glaze.",
  });

  const isOwner =
    currentUserId !== undefined &&
    String(glaze.posting_user.id) === String(currentUserId);

  const isAdmin = useIsAdmin() === true;

  if (isEditing) {
    return (
      <EntryEditCard
        title={title}
        body={body}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        titlePlaceholder="Glaze title..."
        bodyPlaceholder="Share why they deserve a glaze..."
        error={error}
        isPending={isPending}
        onCancel={cancelEditing}
        onSave={handleSave}
      />
    );
  }

  const actions = isOwner ? (
    <EditDeleteActions
      onEdit={startEditing}
      onDelete={handleDelete}
      isPending={isPending}
    />
  ) : isAdmin ? (
    <DeleteButton onDelete={handleDelete} isPending={isPending} />
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
        reactions={
          <ReactionBar
            target="glazes"
            entityId={glaze.id}
            initialReactions={glaze.reactions ?? []}
            currentUserId={currentUserId}
          />
        }
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
