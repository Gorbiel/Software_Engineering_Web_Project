import { type DateRange } from "@/utils/reports";

type DateRangeControlsProps = {
  range: DateRange;
  onChange: (range: DateRange) => void;
};

const inputClass =
  "border-border bg-surface text-text rounded-2xl border px-3 py-2 text-sm focus:border-primary outline-none";

export function DateRangeControls({ range, onChange }: DateRangeControlsProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-text-muted text-[10px] font-black uppercase">
          From
        </span>
        <input
          type="date"
          value={range.from}
          max={range.to}
          onChange={(event) =>
            onChange({ ...range, from: event.target.value })
          }
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-text-muted text-[10px] font-black uppercase">
          To
        </span>
        <input
          type="date"
          value={range.to}
          min={range.from}
          onChange={(event) => onChange({ ...range, to: event.target.value })}
          className={inputClass}
        />
      </label>
    </div>
  );
}
