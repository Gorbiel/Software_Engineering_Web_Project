"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/misc/Avatar";
import {
  getUserLeaderboard,
  type UserLeaderboardEntry,
} from "@/utils/leaderboard";

export function TopGlazersCard() {
  const [entries, setEntries] = useState<UserLeaderboardEntry[] | null>(null);

  useEffect(() => {
    let ignore = false;
    getUserLeaderboard("total_score", undefined, 3)
      .then((data) => {
        if (!ignore) setEntries(data.results);
      })
      .catch(() => {
        if (!ignore) setEntries([]);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="glaze-card flex flex-col gap-4">
      <h2 className="text-text text-sm font-semibold">Top Glazers</h2>
      <div className="flex flex-col gap-3">
        {entries === null ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-text-muted text-sm">No data yet.</p>
        ) : (
          entries.map((entry) => (
            <Link
              key={entry.user_id}
              href={`/profile/${entry.user_id}`}
              className="bg-background hover:border-border flex items-center justify-between gap-3 rounded-2xl border border-transparent px-3 py-2 transition"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-text-muted text-xs font-semibold select-none">
                  #{entry.rank}
                </span>
                <Avatar
                  name={entry.name}
                  src={entry.profile_picture}
                  className="bg-accent-soft text-accent h-8 w-8 shrink-0 overflow-hidden text-xs font-bold"
                />
                <span className="text-text truncate text-sm font-semibold">
                  {entry.name}
                </span>
              </div>
              <span className="text-primary shrink-0 text-sm font-bold">
                {entry.total_score}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
