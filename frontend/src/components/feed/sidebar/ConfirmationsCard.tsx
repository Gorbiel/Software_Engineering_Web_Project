export function ConfirmationsCard() {
  return (
    <div className="glaze-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-text text-sm font-semibold">Confirmations</h2>
        <span className="bg-accent-softer text-accent rounded-full px-2 py-1 text-xs font-semibold">
          3
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-background flex items-center gap-3 rounded-2xl p-3">
          <div className="bg-surface h-9 w-9 rounded-full" />
          <div className="flex-1">
            <div className="bg-surface h-3 w-32 rounded-full" />
            <div className="bg-surface mt-2 h-3 w-20 rounded-full" />
          </div>
          <div className="bg-surface h-7 w-16 rounded-full" />
        </div>
        <button className="bg-background border-border text-text-muted hover:bg-primary hover:text-primary-contrast cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition select-none">
          View more requests
        </button>
      </div>
    </div>
  );
}
