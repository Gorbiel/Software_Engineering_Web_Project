export function YourTeamCard() {
  return (
    <div className="glaze-card flex flex-col gap-4">
      <h2 className="text-text text-sm font-semibold">Your Team</h2>
      <div className="flex flex-col gap-3">
        {["Lead", "Developer", "Manager"].map((role) => (
          <div
            key={role}
            className="bg-background flex items-center justify-between rounded-2xl px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <div className="bg-surface h-8 w-8 rounded-full" />
              <div>
                <div className="bg-surface h-3 w-20 rounded-full" />
                <div className="bg-surface mt-2 h-3 w-14 rounded-full" />
              </div>
            </div>
            <span className="bg-accent h-2 w-2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
