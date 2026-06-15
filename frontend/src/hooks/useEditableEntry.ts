import { useState } from "react";

type UseEditableEntryParams<T> = {
  // Current persisted values, used to seed the draft and to reset on edit.
  entityTitle: string;
  entityBody: string;
  save: (updates: { title: string; body: string }) => Promise<T>;
  onChanged: (updated: T) => void;
  remove: () => Promise<void>;
  onDeleted: () => void;
  deleteConfirmMessage: string;
  deleteErrorMessage: string;
};

// Shared edit/save/delete state machine for the title+body entries rendered by
// AchievementItem and GlazeItem. Entry-specific behaviour (confirmations,
// request modal, card layout) stays in the component.
export function useEditableEntry<T>({
  entityTitle,
  entityBody,
  save,
  onChanged,
  remove,
  onDeleted,
  deleteConfirmMessage,
  deleteErrorMessage,
}: UseEditableEntryParams<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(entityTitle);
  const [body, setBody] = useState(entityBody);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setTitle(entityTitle);
    setBody(entityBody);
    setError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  async function handleSave() {
    if (title.trim() === "" || body.trim() === "" || isPending) {
      return;
    }
    setError(null);
    setIsPending(true);

    try {
      const updated = await save({ title: title.trim(), body: body.trim() });
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
    if (!window.confirm(deleteConfirmMessage)) {
      return;
    }
    setError(null);
    setIsPending(true);

    try {
      await remove();
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : deleteErrorMessage);
      setIsPending(false);
    }
  }

  return {
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
  };
}
