"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AchievementItem } from "@/components/achievements/AchievementItem";
import { AchievementInput } from "@/components/feed/AchievementInput";
import { type Achievement, fetchAchievements } from "@/utils/achievements";

export function AchievementFeed() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchAchievements()
      .then((data) => {
        if (active) {
          setAchievements(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load the feed.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCreated = useCallback((achievement: Achievement) => {
    setAchievements((prev) => [achievement, ...prev]);
  }, []);

  const handleChanged = useCallback((updated: Achievement) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    );
  }, []);

  const handleDeleted = useCallback((id: number) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <>
      <AchievementInput onCreated={handleCreated} />

      {isLoading ? (
        <p className="text-text-muted px-1 text-sm">Loading achievements…</p>
      ) : error ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-3 text-sm font-semibold">
          {error}
        </p>
      ) : achievements.length === 0 ? (
        <p className="text-text-muted px-1 text-sm">
          No achievements yet. Be the first to share one!
        </p>
      ) : (
        achievements.map((achievement) => (
          <AchievementItem
            key={achievement.id}
            achievement={achievement}
            currentUserId={user?.id}
            onChanged={handleChanged}
            onDeleted={handleDeleted}
          />
        ))
      )}
    </>
  );
}
