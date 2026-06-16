"use client";

import { useMemo, useState } from "react";
import {
  type ReactionEntry,
  type ReactionTarget,
  addReaction,
  removeReaction,
} from "@/utils/reactions";

type UseReactionsArgs = {
  target: ReactionTarget;
  entityId: number;
  initialReactions: ReactionEntry[];
  currentUserId: number | string | undefined;
};

export type ReactionCount = {
  code: string;
  emoji: string | null;
  count: number;
};

export function useReactions({
  target,
  entityId,
  initialReactions,
  currentUserId,
}: UseReactionsArgs) {
  const [reactions, setReactions] = useState<ReactionEntry[]>(initialReactions);
  const [isPending, setIsPending] = useState(false);

  const myReaction = useMemo(() => {
    if (currentUserId === undefined) {
      return null;
    }
    return (
      reactions.find((entry) => String(entry.user.id) === String(currentUserId)) ??
      null
    );
  }, [reactions, currentUserId]);

  const counts = useMemo<ReactionCount[]>(() => {
    const grouped = new Map<string, ReactionCount>();
    for (const entry of reactions) {
      const existing = grouped.get(entry.reaction.code);
      if (existing) {
        existing.count += 1;
      } else {
        grouped.set(entry.reaction.code, {
          code: entry.reaction.code,
          emoji: entry.reaction.emoji,
          count: 1,
        });
      }
    }
    return Array.from(grouped.values());
  }, [reactions]);

  async function toggle(code: string) {
    if (isPending || currentUserId === undefined) {
      return;
    }
    setIsPending(true);
    try {
      const previous = myReaction;
      if (previous) {
        await removeReaction(target, entityId, previous.id);
        setReactions((current) =>
          current.filter((entry) => entry.id !== previous.id),
        );
      }
      if (!previous || previous.reaction.code !== code) {
        const created = await addReaction(target, entityId, code);
        setReactions((current) => [...current, created]);
      }
    } finally {
      setIsPending(false);
    }
  }

  return { myReaction, counts, isPending, toggle };
}
