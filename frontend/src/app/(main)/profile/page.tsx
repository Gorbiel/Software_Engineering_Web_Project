"use client";

import { Award, Lock, Rocket } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PageShell } from "@/components/layout/PageShell";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";

export default function ProfilePage() {
  const { user } = useAuth();

  const displayName = user?.name ?? "Alex Baker";

  const sidebar = (
    <div className="hidden flex-col gap-6 xl:flex">
      <div className="glaze-card flex flex-col gap-4">
        <h3 className="text-text text-sm font-semibold">
          Badges &amp; Rewards
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="bg-accent-3-soft flex h-12 w-12 items-center justify-center rounded-full">
              <Award className="text-primary h-5 w-5" />
            </div>
            <span className="text-text-muted text-[10px] font-bold">MVP</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-accent-2-soft flex h-12 w-12 items-center justify-center rounded-full">
              <Rocket className="text-accent-2 h-5 w-5" />
            </div>
            <span className="text-text-muted text-[10px] font-bold">
              Pioneer
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-background flex h-12 w-12 items-center justify-center rounded-full">
              <Lock className="text-text-muted h-5 w-5" />
            </div>
            <span className="text-text-muted text-[10px] font-bold">
              Hidden
            </span>
          </div>
        </div>
      </div>

      <div className="glaze-card flex flex-col gap-3">
        <h3 className="text-text-muted text-xs font-bold tracking-wider uppercase">
          Level Progress
        </h3>
        <div className="flex items-end gap-2">
          <span className="text-primary text-4xl font-black">12</span>
          <span className="text-text-muted mb-1 text-sm font-semibold">
            / 20 Rank
          </span>
        </div>
        <div className="flex justify-between text-[10px] font-bold uppercase">
          <span className="text-text-muted">Apprentice</span>
          <span className="text-accent">Master Glazer</span>
        </div>
        <div className="bg-background h-2 w-full overflow-hidden rounded-full">
          <div className="bg-accent h-full w-3/5 rounded-full" />
        </div>
      </div>
    </div>
  );

  return (
    <PageShell sidebar={sidebar}>
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
