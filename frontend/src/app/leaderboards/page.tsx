"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/PageShell";

type Trend = "up" | "down" | "neutral";

type RankingEntry = {
  rank: number;
  name: string;
  sprinkles: number;
  trend: Trend;
};

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
  const podiumEntries = [
    ranking.top[1],
    ranking.top[0],
    ranking.top[2],
  ].filter(Boolean);
  const podiumHeights = ["h-50", "h-60", "h-40"];
  const podiumBadgeClass = (rank: number) => {
    if (rank === 1) {
      return "text-accent bg-accent-soft";
    }
    if (rank === 2) {
      return "text-accent-2 bg-accent-2-soft";
    }
    return "text-accent-3 bg-accent-3-soft";
  };

  const renderTrend = (trend: Trend) => {
    if (trend === "up") {
      return <TrendingUp className="text-accent-2 h-4 w-4" />;
    }
    if (trend === "down") {
      return <TrendingDown className="text-accent h-4 w-4" />;
    }
    return <span className="text-text-muted text-[10px] font-semibold">—</span>;
  };

  const renderRow = (entry: RankingEntry, highlight?: boolean) => (
    <div
      key={entry.rank}
      className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${
        !highlight
          ? "bg-background"
          : entry.trend === "up"
            ? "border-accent-2 bg-accent-2-softer border"
            : entry.trend === "down"
              ? "border-accent bg-accent-softer border"
              : "border-primary bg-background border"
      }`}
    >
      <div className="flex flex-1 items-center gap-3">
        <span className="text-text-muted text-xs font-semibold">
          #{entry.rank}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold uppercase ${
            entry.rank % 4 === 0
              ? "text-accent bg-accent-soft"
              : entry.rank % 4 === 1
                ? "text-accent-2 bg-accent-2-soft"
                : "text-accent-3 bg-accent-3-soft"
          } `}
        >
          {entry.name
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")}
        </div>
        <span className="text-text text-xs font-semibold">{entry.name}</span>
      </div>
      <div className="flex w-16 items-center justify-center">
        {renderTrend(entry.trend)}
      </div>
      <div className="text-text-muted w-20 text-right text-xs font-semibold">
        {entry.sprinkles}
      </div>
    </div>
  );

  return (
    <PageShell
      sidebar={
        <div className="glaze-card flex flex-col gap-4">
          <h2 className="text-text text-sm font-semibold">Rising Stars</h2>
          <div className="flex flex-col gap-3">
            {["+42%", "+38%"].map((growth) => (
              <div
                key={growth}
                className="bg-background flex items-center justify-between rounded-2xl px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-surface h-8 w-8 rounded-full" />
                  <div className="bg-surface h-3 w-24 rounded-full" />
                </div>
                <span className="text-accent text-xs font-semibold">
                  {growth}
                </span>
              </div>
            ))}
          </div>
          <button className="bg-background border-border text-text-muted hover:bg-primary hover:text-primary-contrast cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition select-none">
            View All Activity
          </button>
        </div>
      }
    >
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
        <div className="flex items-end justify-center gap-4 py-6">
          {podiumEntries.map((entry, index) => {
            const initials = entry.name
              .split(" ")
              .slice(0, 2)
              .map((part) => part[0])
              .join("");
            const height = podiumHeights[index] ?? podiumHeights[0];

            return (
              <div
                key={entry.rank}
                className={`bg-background relative flex w-32 flex-col items-center justify-between rounded-3xl px-4 py-4 ${height}`}
              >
                {entry.rank === 1 ? (
                  <div className="absolute -top-3 -right-2 rounded-full text-4xl  rotate-20">
                    👑
                  </div>
                ) : null}
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-sm font-semibold uppercase ${podiumBadgeClass(entry.rank)}`}
                >
                  {initials}
                </div>
                <div className="text-center">
                  <div className="text-text text-sm font-semibold">
                    {entry.name}
                  </div>
                  <div className="text-text-muted text-xs font-semibold">
                    {entry.sprinkles} pts
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs font-semibold ${entry.trend === "up" ? "text-accent-2" : entry.trend === "down" ? "text-accent" : "text-text-muted"}`}
                  >
                    #{entry.rank}
                  </span>
                  <div className="flex w-4 items-center justify-center">
                    {renderTrend(entry.trend)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="glaze-card flex flex-col gap-4">
        <div className="text-text-muted flex items-center gap-3 text-xs font-semibold">
          <span className="flex-1">Rank & User</span>
          <span className="w-16 text-center">Trend</span>
          <span className="w-20 text-right">Sprinkles</span>
        </div>
        <div className="flex flex-col gap-3">
          {ranking.top.slice(3).map((entry) => renderRow(entry))}
          <div className="bg-background text-text-muted flex h-10 items-center justify-center rounded-2xl">
            ...
          </div>
          {renderRow(ranking.user, true)}
          {ranking.after.map((entry) => renderRow(entry))}
        </div>
      </div>
    </PageShell>
  );
}
