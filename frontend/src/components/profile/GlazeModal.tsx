"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import { Modal } from "@/components/misc/Modal";
import { TitleBodyFields } from "@/components/forms/TitleBodyFields";
import { type Glaze, createGlaze } from "@/utils/glazes";
import TagSelector from "@/components/tags/TagSelector";
import { type TagListItem } from "@/utils/tags";

type GlazeModalProps = {
  receivingUserId: number | string;
  receivingUserName: string;
  onClose: () => void;
  onCreated?: (glaze: Glaze) => void;
};

export function GlazeModal({
  receivingUserId,
  receivingUserName,
  onClose,
  onCreated,
}: GlazeModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagListItem[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const canSubmit = title.trim() !== "" && body.trim() !== "" && !isPending;

  function cleanup() {
    setTitle("");
    setBody("");
    setSelectedTags([]);
    setShowTagSelector(false);
    setError(null);
    setIsPending(false);
  }

  function handleCancel() {
    cleanup();
    onClose();
  }

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    setError(null);
    setIsPending(true);

    try {
      const glaze = await createGlaze({
        receivingUserId,
        title: title.trim(),
        body: body.trim(),
        tag_ids: selectedTags.map((tag) => tag.id),
      });
      onCreated?.(glaze);
      cleanup();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send glaze.");
      setIsPending(false);
    }
  }

  return (
    <Modal
      onClose={handleCancel}
      closeDisabled={isPending}
      ariaLabel={`Glaze ${receivingUserName}`}
      backdropClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      panelClassName="glaze-card flex w-full max-w-md flex-col gap-4"
    >
      <h2 className="text-text text-lg font-bold">Glaze {receivingUserName}</h2>

      <TitleBodyFields
        title={title}
        body={body}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        titlePlaceholder="Glaze title..."
        bodyPlaceholder={`Tell everyone why ${receivingUserName} deserves a glaze...`}
        autoFocus
      />

      <div className="flex items-center gap-2">
        <button
          className={`cursor-pointer rounded-full p-2 transition ${
            showTagSelector
              ? "bg-accent-2-soft text-accent-2"
              : "text-accent-2 hover:bg-accent-2-soft"
          }`}
          type="button"
          onClick={() => setShowTagSelector(!showTagSelector)}
          disabled={isPending}
          title={showTagSelector ? "Hide tags" : "Add tags"}
        >
          <Tag className="h-5 w-5" />
        </button>
        <span className="text-sm text-gray-600">
          {showTagSelector ? "Hide tags" : "Add tags"}
        </span>
      </div>

      {showTagSelector && (
        <TagSelector
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          disabled={isPending}
        />
      )}

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
    </Modal>
  );
}
