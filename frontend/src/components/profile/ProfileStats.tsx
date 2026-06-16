import { Star, Zap, Megaphone } from "lucide-react";
import { StatCard } from "./StatCard";

type ProfileStatsProps = {
  achievements: number;
  glazesGiven: number;
  glazesReceived: number;
  totalSprinkles: number;
};

export function ProfileStats({
  achievements,
  glazesGiven,
  glazesReceived,
  totalSprinkles,
}: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard icon={Star} label="Achievements">
        <span className="text-text text-5xl font-black">{achievements}</span>
      </StatCard>

      <StatCard icon={Megaphone} label="Glazes">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-text text-2xl font-bold">
              {glazesGiven}
            </span>
            <span className="text-text-muted text-[10px] font-black uppercase">
              Given
            </span>
          </div>
          <div className="bg-border h-10 w-px" />
          <div className="flex flex-col items-center">
            <span className="text-text text-2xl font-bold">
              {glazesReceived}
            </span>
            <span className="text-text-muted text-[10px] font-black uppercase">
              Recv.
            </span>
          </div>
        </div>
      </StatCard>

      <StatCard icon={Zap} label="Total points">
        <span className="text-primary text-5xl font-black">
          {totalSprinkles}
        </span>
      </StatCard>
    </div>
  );
}
