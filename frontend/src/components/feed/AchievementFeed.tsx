"use client";

import { useCallback, useEffect, useState } from "react";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { AchievementInput } from "@/components/feed/AchievementInput";
import { type Achievement, fetchAchievements } from "@/utils/achievements";
import { formatRelativeTime } from "@/utils/date";

export function AchievementFeed() {
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
          <AchievementCard
            key={achievement.id}
            authorName={achievement.user.name}
            title={achievement.title}
            date={`Shared ${formatRelativeTime(achievement.creation_date)}`}
            likes={0}
            comments={0}
            confirmedBy={achievement.confirmations.map((c) => c.user.name)}
          >
            {achievement.body}
          </AchievementCard>
        ))
      )}
    </>
  );
}
