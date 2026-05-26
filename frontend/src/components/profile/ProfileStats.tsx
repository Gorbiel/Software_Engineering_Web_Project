import { Star, Zap, Megaphone } from "lucide-react";
import { StatCard } from "./StatCard";

type ProfileStatsProps = {
  achievements: number;
  shoutoutsGiven: number;
  shoutoutsReceived: number;
  totalSprinkles: number;
};

export function ProfileStats({
  achievements,
  shoutoutsGiven,
  shoutoutsReceived,
  totalSprinkles,
}: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard icon={Star} label="Achievements">
        <span className="text-text text-5xl font-black">{achievements}</span>
      </StatCard>

      <StatCard icon={Megaphone} label="Shout-outs">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-text text-2xl font-bold">
              {shoutoutsGiven}
            </span>
            <span className="text-text-muted text-[10px] font-black uppercase">
              Given
            </span>
          </div>
          <div className="bg-border h-10 w-px" />
          <div className="flex flex-col items-center">
            <span className="text-text text-2xl font-bold">
              {shoutoutsReceived}
            </span>
            <span className="text-text-muted text-[10px] font-black uppercase">
              Recv.
            </span>
          </div>
        </div>
      </StatCard>

      <StatCard icon={Zap} label="Total Sprinkles">
        <span className="text-primary text-5xl font-black">
          {totalSprinkles}
        </span>
      </StatCard>
    </div>
  );
}
