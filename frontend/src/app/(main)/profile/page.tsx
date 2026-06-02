"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageShell } from "@/components/layout/PageShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { BadgesCard } from "@/components/profile/sidebar/BadgesCard";
import { LevelProgressCard } from "@/components/profile/sidebar/LevelProgressCard";
import { type Achievement, fetchAchievements } from "@/utils/achievements";

export default function ProfilePage() {
  const { user } = useAuth();
  const displayName = user?.name ?? "Alex Baker";
  const userId = user?.id;

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId === undefined) {
      return;
    }

    let active = true;

    fetchAchievements({ userId })
      .then((data) => {
        if (active) {
          setAchievements(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load achievements.",
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
  }, [userId]);

  const handleChanged = useCallback((updated: Achievement) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    );
  }, []);

  const handleDeleted = useCallback((id: number) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <PageShell
      sidebar={
        <div className="hidden flex-col gap-6 xl:flex">
          <BadgesCard />
          <LevelProgressCard />
        </div>
      }
    >
      <ProfileHeader
        name={displayName}
        subtitle="Senior Experience Designer • Engineering Team"
      />

      <ProfileStats
        achievements={achievements.length}
        shoutoutsGiven={128}
        shoutoutsReceived={84}
        totalSprinkles={4250}
      />

      <ProfileAchievements
        currentUserId={userId}
        achievements={achievements}
        isLoading={isLoading}
        error={error}
        onChanged={handleChanged}
        onDeleted={handleDeleted}
      />
    </PageShell>
  );
}
