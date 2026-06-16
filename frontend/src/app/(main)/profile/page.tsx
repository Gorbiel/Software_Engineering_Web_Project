"use client";

import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/context/MyProfileContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { ProfileGlazes } from "@/components/profile/ProfileGlazes";
import { useProfileData } from "@/hooks/useProfileData";
import { useUserScore } from "@/hooks/useUserScore";

export default function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const { profile, error: profileError } = useMyProfile();
  const totalScore = useUserScore(userId);

  const {
    achievements,
    isLoading,
    achievementsError,
    handleChanged,
    handleDeleted,
    glazes,
    glazesLoading,
    glazesError,
    glazesGivenCount,
    handleGlazeChanged,
    handleGlazeDeleted,
  } = useProfileData(userId);

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
        totalSprinkles={totalScore ?? 0}
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
