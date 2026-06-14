"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { ProfileGlazes } from "@/components/profile/ProfileGlazes";
import { GlazeModal } from "@/components/profile/GlazeModal";
import { type Achievement, fetchAchievements } from "@/utils/achievements";
import { type Glaze, fetchGlazes } from "@/utils/glazes";
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

  const [glazes, setGlazes] = useState<Glaze[]>([]);
  const [glazesLoading, setGlazesLoading] = useState(true);
  const [glazesError, setGlazesError] = useState<string | null>(null);
  const [glazesGivenCount, setGlazesGivenCount] = useState(0);

  const [isGlazeOpen, setIsGlazeOpen] = useState(false);

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

  useEffect(() => {
    if (profileId === undefined) {
      return;
    }

    let active = true;

    Promise.all([
      fetchGlazes({ receivedBy: profileId }),
      fetchGlazes({ sentBy: profileId }),
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
  }, [profileId]);

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

  const handleGlazeCreated = useCallback((created: Glaze) => {
    setGlazes((prev) => [created, ...prev]);
  }, []);

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
