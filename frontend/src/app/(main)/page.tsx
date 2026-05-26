import { PageShell } from "@/components/layout/PageShell";
import { Tag } from "lucide-react";

export default function Home() {
  return (
    <PageShell
      sidebar={
        <div className="hidden flex-col gap-6 xl:flex">
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
                View All Requests
              </button>
            </div>
          </div>
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
        </div>
      }
    >
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
      <div className="glaze-card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-background h-10 w-10 rounded-full" />
            <div>
              <div className="bg-background h-3 w-24 rounded-full" />
              <div className="bg-background mt-2 h-3 w-16 rounded-full" />
            </div>
          </div>
          <div className="bg-background h-6 w-20 rounded-full" />
        </div>
        <div className="bg-background h-16 rounded-2xl" />
        <div className="text-text-muted flex items-center gap-4 text-xs">
          <span className="bg-background h-3 w-24 rounded-full" />
          <span className="bg-background h-3 w-20 rounded-full" />
        </div>
      </div>
      <div className="glaze-card flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-background h-10 w-10 rounded-full" />
          <div className="bg-background h-3 w-32 rounded-full" />
        </div>
        <div className="bg-background h-20 rounded-2xl" />
        <div className="flex items-center gap-3">
          <div className="bg-background h-8 w-16 rounded-full" />
          <div className="bg-background h-8 w-20 rounded-full" />
        </div>
      </div>
    </PageShell>
  );
}
