import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { TrendIcon } from "./TrendIcon";
import type { RankingEntry } from "./types";

const podiumHeights = ["h-50", "h-60", "h-40"];

function podiumBadgeClass(rank: number): string {
  if (rank === 1) return "text-accent bg-accent-soft";
  if (rank === 2) return "text-accent-2 bg-accent-2-soft";
  return "text-accent-3 bg-accent-3-soft";
}

export function RankingPodium({ top3 }: { top3: RankingEntry[] }) {
  const entries = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="flex items-end justify-center gap-4 py-6">
      {entries.map((entry, index) => {
        const height = podiumHeights[index] ?? podiumHeights[0];
        return (
          <div
            key={entry.rank}
            className={`bg-background relative flex w-32 flex-col items-center justify-between rounded-3xl px-4 py-4 ${height}`}
          >
            {entry.rank === 1 ? (
              <div className="absolute -top-3 -right-2 rotate-20 rounded-full text-4xl">
                👑
              </div>
            ) : null}
            <AvatarInitials
              name={entry.name}
              className={`h-16 w-16 text-sm font-semibold ${podiumBadgeClass(entry.rank)}`}
            />
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
                className={`text-xs font-semibold ${
                  entry.trend === "up"
                    ? "text-accent-2"
                    : entry.trend === "down"
                      ? "text-accent"
                      : "text-text-muted"
                }`}
              >
                #{entry.rank}
              </span>
              <div className="flex w-4 items-center justify-center">
                <TrendIcon trend={entry.trend} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
