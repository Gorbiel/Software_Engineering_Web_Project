"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AchievementItem } from "@/components/achievements/AchievementItem";
import { GlazeItem } from "@/components/glazes/GlazeItem";
import { AchievementInput } from "@/components/feed/AchievementInput";
import { type Achievement, fetchAchievements } from "@/utils/achievements";
import { type Glaze, fetchGlazes } from "@/utils/glazes";

type FeedItem =
  | { kind: "achievement"; date: string; achievement: Achievement }
  | { kind: "glaze"; date: string; glaze: Glaze };

export function AchievementFeed() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [glazes, setGlazes] = useState<Glaze[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([fetchAchievements(), fetchGlazes()])
      .then(([achievementData, glazeData]) => {
        if (active) {
          setAchievements(achievementData);
          setGlazes(glazeData);
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

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [
      ...achievements.map(
        (achievement): FeedItem => ({
          kind: "achievement",
          date: achievement.creation_date,
          achievement,
        }),
      ),
      ...glazes.map(
        (glaze): FeedItem => ({
          kind: "glaze",
          date: glaze.creation_date,
          glaze,
        }),
      ),
    ];
    return items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [achievements, glazes]);

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

  const handleGlazeChanged = useCallback((updated: Glaze) => {
    setGlazes((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  }, []);

  const handleGlazeDeleted = useCallback((id: number) => {
    setGlazes((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return (
    <>
      <AchievementInput onCreated={handleCreated} />

      {isLoading ? (
        <p className="text-text-muted px-1 text-sm">Loading feed…</p>
      ) : error ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-3 text-sm font-semibold">
          {error}
        </p>
      ) : feedItems.length === 0 ? (
        <p className="text-text-muted px-1 text-sm">
          Nothing here yet. Be the first to share something!
        </p>
      ) : (
        feedItems.map((item) =>
          item.kind === "achievement" ? (
            <AchievementItem
              key={`achievement-${item.achievement.id}`}
              achievement={item.achievement}
              currentUserId={user?.id}
              onChanged={handleChanged}
              onDeleted={handleDeleted}
            />
          ) : (
            <GlazeItem
              key={`glaze-${item.glaze.id}`}
              glaze={item.glaze}
              currentUserId={user?.id}
              onChanged={handleGlazeChanged}
              onDeleted={handleGlazeDeleted}
            />
          ),
        )
      )}
    </>
  );
}
