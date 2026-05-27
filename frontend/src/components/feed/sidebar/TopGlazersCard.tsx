export function TopGlazersCard() {
  return (
    <div className="glaze-card flex flex-col gap-4">
      <h2 className="text-text text-sm font-semibold">Top Glazers</h2>
      <div className="flex flex-col gap-3">
        {["#1", "#2", "#3"].map((rank) => (
          <div
            key={rank}
            className="bg-background flex items-center justify-between rounded-2xl px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-text-muted text-xs font-semibold select-none">
                {rank}
              </span>
              <div className="bg-surface h-8 w-8 rounded-full" />
              <div className="bg-surface h-3 w-24 rounded-full" />
            </div>
            <div className="bg-surface h-3 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
