"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { type Achievement, fetchAchievements } from "@/utils/achievements";
import { fetchUser, type UserSearchResult } from "@/utils/users";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const profileId = params.id;

  const { user } = useAuth();
  const currentUserId = user?.id;

  const [profile, setProfile] = useState<UserSearchResult | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [achievementsError, setAchievementsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (profileId === undefined) {
      return;
    }

    let active = true;

    fetchUser(profileId)
      .then((data) => {
        if (active) {
          setProfile(data);
          setProfileError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setProfileError(
            err instanceof Error ? err.message : "Couldn't load profile.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [profileId]);

  useEffect(() => {
    if (profileId === undefined) {
      return;
    }

    let active = true;

    fetchAchievements({ userId: profileId })
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
  }, [profileId]);

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
      <ProfileHeader
        name={profile?.name ?? ""}
        subtitle={profile?.job_title ?? undefined}
        bio={profile?.bio_text ?? undefined}
        photoUrl={profile?.profile_picture ?? null}
        editable={false}
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
        title="Achievements"
        currentUserId={currentUserId}
        achievements={achievements}
        isLoading={isLoading}
        error={achievementsError}
        onChanged={handleChanged}
        onDeleted={handleDeleted}
      />
    </>
  );
}
