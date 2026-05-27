import { AvatarInitials } from "@/components/misc/AvatarInitials";
import { TrendIcon } from "./TrendIcon";
import type { RankingEntry } from "./types";

function avatarColorClass(rank: number): string {
  if (rank % 3 === 1) return "text-accent bg-accent-soft";
  if (rank % 3 === 2) return "text-accent-2 bg-accent-2-soft";
  return "text-accent-3 bg-accent-3-soft";
}

function rowBgClass(entry: RankingEntry, highlight: boolean): string {
  if (!highlight) return "bg-background";
  if (entry.trend === "up") return "border-accent-2 bg-accent-2-softer border";
  if (entry.trend === "down") return "border-accent bg-accent-softer border";
  return "border-primary bg-background border";
}

export function RankingRow({
  entry,
  highlight = false,
}: {
  entry: RankingEntry;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${rowBgClass(entry, highlight)}`}
    >
      <div className="flex flex-1 items-center gap-3">
        <span className="text-text-muted text-xs font-semibold">
          #{entry.rank}
        </span>
        <AvatarInitials
          name={entry.name}
          className={`h-8 w-8 text-xs font-semibold ${avatarColorClass(entry.rank)}`}
        />
        <span className="text-text text-xs font-semibold">{entry.name}</span>
      </div>
      <div className="flex w-16 items-center justify-center">
        <TrendIcon trend={entry.trend} />
      </div>
      <div className="text-text-muted w-20 text-right text-xs font-semibold">
        {entry.sprinkles}
      </div>
    </div>
  );
}
