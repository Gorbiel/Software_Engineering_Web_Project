"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import { TitleBodyFields } from "@/components/forms/TitleBodyFields";
import { type Achievement, createAchievement } from "@/utils/achievements";
import TagSelector from "@/components/tags/TagSelector";
import { type TagListItem } from "@/utils/tags";

type AchievementInputProps = {
  onCreated: (achievement: Achievement) => void;
};

export function AchievementInput({ onCreated }: AchievementInputProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagListItem[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const canSubmit = title.trim() !== "" && body.trim() !== "" && !isPending;

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    setError(null);
    setIsPending(true);

    try {
      const achievement = await createAchievement({
        title: title.trim(),
        body: body.trim(),
        tag_ids: selectedTags.map((tag) => tag.id),
      });
      onCreated(achievement);
      setTitle("");
      setBody("");
      setSelectedTags([]);
      setShowTagSelector(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to post achievement.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="glaze-card flex flex-col gap-4">
      <TitleBodyFields
        title={title}
        body={body}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        titlePlaceholder="Achievement title..."
        bodyPlaceholder="Share your latest achievement..."
      />
      
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
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <button
          className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isPending ? "Posting…" : "Add Achievement"}
        </button>
      </div>
    </div>
  );
}
