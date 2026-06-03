"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/context/MyProfileContext";
import { PageShell } from "@/components/layout/PageShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { BadgesCard } from "@/components/profile/sidebar/BadgesCard";
import { LevelProgressCard } from "@/components/profile/sidebar/LevelProgressCard";
import { type Achievement, fetchAchievements } from "@/utils/achievements";

export default function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const { profile, error: profileError } = useMyProfile();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [achievementsError, setAchievementsError] = useState<string | null>(null);

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
          setAchievementsError(
            err instanceof Error ? err.message : "Unable to load achievements.",
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
        name={profile?.name ?? ""}
        subtitle={profile?.job_title ?? undefined}
        bio={profile?.bio_text ?? undefined}
      />

      {profileError ? (
        <p className="bg-accent-softer text-accent rounded-2xl px-4 py-3 text-sm font-semibold">
          {profileError}
        </p>
      ) : null}

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
        error={achievementsError}
        onChanged={handleChanged}
        onDeleted={handleDeleted}
      />
    </PageShell>
  );
}
