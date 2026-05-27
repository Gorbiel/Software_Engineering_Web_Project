"use client";

import { useAuth } from "@/context/AuthContext";
import { PageShell } from "@/components/layout/PageShell";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { BadgesCard } from "@/components/profile/sidebar/BadgesCard";
import { LevelProgressCard } from "@/components/profile/sidebar/LevelProgressCard";

export default function ProfilePage() {
  const { user } = useAuth();

  const displayName = user?.name ?? "Alex Baker";

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
        achievements={42}
        shoutoutsGiven={128}
        shoutoutsReceived={84}
        totalSprinkles={4250}
      />

      <div className="flex flex-col gap-4">
        <h2 className="text-text text-base font-semibold">My Achievements</h2>

        <AchievementCard
          authorName={displayName}
          title="Q3 Product Launch Hero"
          date="Shared 2 days ago"
          likes={24}
          comments={8}
        >
          So proud of the team for getting the Doughnut Dashboard across the
          finish line! Huge shoutout to the dev team for staying late to polish
          the sprinkle animations. We did it!
        </AchievementCard>

        <AchievementCard
          authorName={displayName}
          title="Design System Revamp"
          date="Shared 1 week ago"
          likes={11}
          comments={3}
        >
          Finally updated the &ldquo;Crust&rdquo; component library.
          Accessibility is now at 100%! Ready to roll this out across all
          platforms. #UX #GlazedDesign
        </AchievementCard>
      </div>
    </PageShell>
  );
}
