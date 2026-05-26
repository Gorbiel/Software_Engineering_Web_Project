"use client";

import Link from "next/link";
import { Award, Lock, Pencil, Rocket, Star, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PageShell } from "@/components/PageShell";
import { AchievementCard } from "@/components/AchievementCard";

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
      {/* Profile header */}
      <div className="glaze-card relative overflow-hidden">
        <div className="relative flex flex-col items-center gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-text text-2xl font-bold">{displayName}</h1>
            <p className="text-text-muted text-sm">
              Senior Experience Designer &bull; Engineering Team
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:justify-start"></div>
          </div>

          <div>
            <Link
              href="/settings"
              className="bg-primary text-primary-contrast hover:bg-primary-strong flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition select-none"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glaze-card flex flex-col items-center gap-2 text-center">
          <Star className="text-primary h-8 w-8" />
          <span className="text-text text-3xl font-black">42</span>
          <span className="text-text-muted text-xs font-semibold">
            Achievements
          </span>
        </div>

        <div className="glaze-card flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-text text-2xl font-bold">128</span>
              <span className="text-text-muted text-[10px] font-black uppercase">
                Given
              </span>
            </div>
            <div className="bg-border h-10 w-px" />
            <div className="flex flex-col items-center">
              <span className="text-text text-2xl font-bold">84</span>
              <span className="text-text-muted text-[10px] font-black uppercase">
                Recv.
              </span>
            </div>
          </div>
          <span className="text-text-muted text-xs font-semibold">
            Shout-outs
          </span>
        </div>

        <div className="glaze-card flex flex-col items-center gap-2 text-center">
          <Zap className="text-primary h-8 w-8" />
          <span className="text-primary text-3xl font-black">4,250</span>
          <span className="text-text-muted text-xs font-semibold">
            Total Sprinkles
          </span>
        </div>
      </div>

      {/* Achievements feed */}
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
