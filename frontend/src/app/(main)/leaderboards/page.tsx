"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { RankingRow } from "@/components/leaderboards/RankingRow";
import { RankingPodium } from "@/components/leaderboards/RankingPodium";
import { RisingStarsCard } from "@/components/leaderboards/sidebar/RisingStarsCard";
import type { RankingEntry } from "@/components/leaderboards/types";

const globalRanking: {
  top: RankingEntry[];
  user: RankingEntry;
  after: RankingEntry[];
} = {
  top: [
    { rank: 1, name: "James C.", sprinkles: 6410, trend: "up" },
    { rank: 2, name: "Sarah L.", sprinkles: 5820, trend: "down" },
    { rank: 3, name: "Maya R.", sprinkles: 5450, trend: "up" },
    { rank: 4, name: "David Wilson", sprinkles: 4900, trend: "up" },
    { rank: 5, name: "Elena Hayes", sprinkles: 4820, trend: "neutral" },
  ],
  user: { rank: 12, name: "Alex Baker (You)", sprinkles: 4250, trend: "down" },
  after: [
    { rank: 13, name: "Tom Parker", sprinkles: 4190, trend: "down" },
    { rank: 14, name: "Lara Singh", sprinkles: 4120, trend: "neutral" },
  ],
};

const teamRanking: {
  top: RankingEntry[];
  user: RankingEntry;
  after: RankingEntry[];
} = {
  top: [
    { rank: 1, name: "Priya Shah", sprinkles: 3210, trend: "up" },
    { rank: 2, name: "Leo Novak", sprinkles: 2950, trend: "down" },
    { rank: 3, name: "Nina Walsh", sprinkles: 2840, trend: "up" },
    { rank: 4, name: "Omar Said", sprinkles: 2720, trend: "neutral" },
    { rank: 5, name: "Hana Kim", sprinkles: 2650, trend: "up" },
  ],
  user: {
    rank: 12,
    name: "Alex Baker (You)",
    sprinkles: 2100,
    trend: "up",
  },
  after: [
    { rank: 13, name: "Luis Ortega", sprinkles: 2050, trend: "neutral" },
    { rank: 14, name: "Rita Gomes", sprinkles: 1980, trend: "down" },
  ],
};

export default function LeaderboardsPage() {
  const [rankingType, setRankingType] = useState<"global" | "team">("global");
  const ranking = rankingType === "global" ? globalRanking : teamRanking;

  return (
    <PageShell sidebar={<RisingStarsCard />}>
      <div className="glaze-card flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-text text-2xl font-semibold">
            Hall of Sprinkles
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRankingType("global")}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition select-none ${
                rankingType === "global"
                  ? "bg-primary text-primary-contrast hover:opacity-90"
                  : "bg-background border-border text-text-muted hover:border-border border"
              }`}
            >
              Global Rankings
            </button>
            <button
              type="button"
              onClick={() => setRankingType("team")}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition select-none ${
                rankingType === "team"
                  ? "bg-primary text-primary-contrast hover:opacity-90"
                  : "bg-background border-border text-text-muted hover:border-border border"
              }`}
            >
              Team Rankings
            </button>
          </div>
        </div>
        <RankingPodium top3={ranking.top.slice(0, 3)} />
      </div>
      <div className="glaze-card flex flex-col gap-4">
        <div className="text-text-muted flex items-center gap-3 text-xs font-semibold">
          <span className="flex-1">Rank & User</span>
          <span className="w-16 text-center">Trend</span>
          <span className="w-20 text-right">Sprinkles</span>
        </div>
        <div className="flex flex-col gap-3">
          {ranking.top.slice(3).map((entry) => (
            <RankingRow key={entry.rank} entry={entry} />
          ))}
          <div className="bg-background text-text-muted flex h-10 items-center justify-center rounded-2xl">
            ...
          </div>
          <RankingRow entry={ranking.user} highlight />
          {ranking.after.map((entry) => (
            <RankingRow key={entry.rank} entry={entry} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
