"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import { type Achievement, createAchievement } from "@/utils/achievements";

type AchievementInputProps = {
  onCreated: (achievement: Achievement) => void;
};

export function AchievementInput({ onCreated }: AchievementInputProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
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
      });
      onCreated(achievement);
      setTitle("");
      setBody("");
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="text-accent-2 hover:bg-accent-2-soft cursor-pointer rounded-full p-2 transition"
          type="button"
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
