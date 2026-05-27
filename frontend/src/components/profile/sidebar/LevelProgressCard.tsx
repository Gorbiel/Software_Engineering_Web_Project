export function LevelProgressCard() {
  return (
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
  );
}
