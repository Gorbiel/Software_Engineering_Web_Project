import { formatDay } from "@/utils/date";

export type DailyValue = { day: string; value: number };

type DailyBarsProps = {
  data: DailyValue[];
  emptyText?: string;
};

export function DailyBars({
  data,
  emptyText = "No activity in this period.",
}: DailyBarsProps) {
  if (data.length === 0) {
    return <p className="text-text-muted text-sm">{emptyText}</p>;
  }

  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <div className="flex flex-col gap-1">
      {data.map((point) => (
        <div key={point.day} className="flex items-center gap-2">
          <span className="text-text-muted w-12 shrink-0 text-[10px] font-semibold">
            {formatDay(point.day)}
          </span>
          <div className="bg-background h-3 flex-1 overflow-hidden rounded-full">
            <div
              className="bg-accent-2 h-full rounded-full"
              style={{ width: `${(point.value / max) * 100}%` }}
            />
          </div>
          <span className="text-text w-8 shrink-0 text-right text-xs font-bold">
            {point.value}
          </span>
        </div>
      ))}
    </div>
  );
}
