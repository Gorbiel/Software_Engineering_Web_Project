import { Tag } from "lucide-react";

export function AchievementInput() {
  return (
    <div className="glaze-card flex flex-col gap-4">
      <div className="bg-background h-28 rounded-2xl px-4 py-3">
        <textarea
          className="placeholder:text-text-muted h-full w-full resize-none bg-transparent text-sm focus:outline-none"
          placeholder="Share your latest achievement..."
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="text-accent-2 hover:bg-accent-2-soft cursor-pointer rounded-full p-2 transition"
          type="button"
        >
          <Tag className="h-5 w-5" />
        </button>
        <button className="bg-primary text-primary-contrast hover:bg-primary-strong cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition select-none">
          Add Achievement
        </button>
      </div>
    </div>
  );
}
