"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { ProfileGlazes } from "@/components/profile/ProfileGlazes";
import { GlazeModal } from "@/components/profile/GlazeModal";
import { useProfileData } from "@/hooks/useProfileData";
import { useUserScore } from "@/hooks/useUserScore";
import { fetchUser, type UserSearchResult } from "@/utils/users";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const profileId = params.id;

  const { user } = useAuth();
  const currentUserId = user?.id;

  const [profile, setProfile] = useState<UserSearchResult | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isGlazeOpen, setIsGlazeOpen] = useState(false);
  const totalScore = useUserScore(profileId);

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
    handleGlazeCreated,
  } = useProfileData(profileId);

  const isOwnProfile =
    currentUserId !== undefined && String(currentUserId) === String(profileId);
  const canGlaze =
    currentUserId !== undefined && !isOwnProfile && profile !== null;

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

  return (
    <>
      <ProfileHeader
        name={profile?.name ?? ""}
        subtitle={profile?.job_title ?? undefined}
        bio={profile?.bio_text ?? undefined}
        photoUrl={profile?.profile_picture ?? null}
        editable={false}
        onGlaze={canGlaze ? () => setIsGlazeOpen(true) : undefined}
      />

      {isGlazeOpen && profile ? (
        <GlazeModal
          receivingUserId={profile.id}
          receivingUserName={profile.name}
          onClose={() => setIsGlazeOpen(false)}
          onCreated={handleGlazeCreated}
        />
      ) : null}

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
        title="Achievements"
        currentUserId={currentUserId}
        achievements={achievements}
        isLoading={isLoading}
        error={achievementsError}
        onChanged={handleChanged}
        onDeleted={handleDeleted}
      />

      <ProfileGlazes
        currentUserId={currentUserId}
        glazes={glazes}
        isLoading={glazesLoading}
        error={glazesError}
        onChanged={handleGlazeChanged}
        onDeleted={handleGlazeDeleted}
      />
    </>
  );
}
