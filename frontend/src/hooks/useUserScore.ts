"use client";

import { useEffect, useState } from "react";
import { getUserScore } from "@/utils/leaderboard";

export function useUserScore(
  userId: number | string | undefined,
): number | null {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (userId === undefined) {
      return;
    }
    let ignore = false;
    getUserScore(userId)
      .then((data) => {
        if (!ignore) setScore(data.total_score);
      })
      .catch(() => {
        if (!ignore) setScore(null);
      });
    return () => {
      ignore = true;
    };
  }, [userId]);

  return score;
}
