"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/context/MyProfileContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { ProfileGlazes } from "@/components/profile/ProfileGlazes";
import { type Achievement, fetchAchievements } from "@/utils/achievements";
import { type Glaze, fetchGlazes } from "@/utils/glazes";

export default function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const { profile, error: profileError } = useMyProfile();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [achievementsError, setAchievementsError] = useState<string | null>(
    null,
  );

  const [glazes, setGlazes] = useState<Glaze[]>([]);
  const [glazesLoading, setGlazesLoading] = useState(true);
  const [glazesError, setGlazesError] = useState<string | null>(null);
  const [glazesGivenCount, setGlazesGivenCount] = useState(0);

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

  useEffect(() => {
    if (userId === undefined) {
      return;
    }

    let active = true;

    Promise.all([
      fetchGlazes({ receivedBy: userId }),
      fetchGlazes({ sentBy: userId }),
    ])
      .then(([received, sent]) => {
        if (active) {
          setGlazes(received);
          setGlazesGivenCount(sent.length);
          setGlazesError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setGlazesError(
            err instanceof Error ? err.message : "Unable to load glazes.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setGlazesLoading(false);
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

  const handleGlazeChanged = useCallback((updated: Glaze) => {
    setGlazes((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  }, []);

  const handleGlazeDeleted = useCallback((id: number) => {
    setGlazes((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return (
    <>
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
        glazesGiven={glazesGivenCount}
        glazesReceived={glazes.length}
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

      <ProfileGlazes
        currentUserId={userId}
        glazes={glazes}
        isLoading={glazesLoading}
        error={glazesError}
        onChanged={handleGlazeChanged}
        onDeleted={handleGlazeDeleted}
      />
    </>
  );
}
