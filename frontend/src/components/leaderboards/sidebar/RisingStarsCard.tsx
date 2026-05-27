export function RisingStarsCard() {
  return (
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
            <span className="text-accent text-xs font-semibold">{growth}</span>
          </div>
        ))}
      </div>
      <button className="bg-background border-border text-text-muted hover:bg-primary hover:text-primary-contrast cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition select-none">
        View All Activity
      </button>
    </div>
  );
}
