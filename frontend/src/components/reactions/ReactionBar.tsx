"use client";

import { type ReactionEntry, type ReactionTarget } from "@/utils/reactions";
import { useReactions } from "@/hooks/useReactions";
import { ReactionPicker } from "@/components/reactions/ReactionPicker";

type ReactionBarProps = {
  target: ReactionTarget;
  entityId: number;
  initialReactions: ReactionEntry[];
  currentUserId: number | string | undefined;
};

export function ReactionBar({
  target,
  entityId,
  initialReactions,
  currentUserId,
}: ReactionBarProps) {
  const { myReaction, counts, isPending, toggle } = useReactions({
    target,
    entityId,
    initialReactions,
    currentUserId,
  });

  const disabled = isPending || currentUserId === undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ReactionPicker
        activeCode={myReaction?.reaction.code ?? null}
        disabled={disabled}
        onSelect={toggle}
      />
      {counts.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          {counts.map((count) => {
            const isMine = myReaction?.reaction.code === count.code;
            return (
              <button
                key={count.code}
                type="button"
                disabled={disabled}
                onClick={() => toggle(count.code)}
                className={`flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition select-none disabled:cursor-not-allowed disabled:opacity-60 ${
                  isMine
                    ? "bg-accent-2-softer text-accent-2"
                    : "bg-background text-text-muted hover:bg-accent-2-soft"
                }`}
              >
                <span className="text-sm leading-none">{count.emoji}</span>
                <span className="font-bold">{count.count}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
