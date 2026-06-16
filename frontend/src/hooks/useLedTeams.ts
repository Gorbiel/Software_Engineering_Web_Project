"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchLedTeams, type Team } from "@/utils/teams";

let cache: { userId: string | number; teams: Team[] } | null = null;

function cachedValue(userId: string | number | undefined): Team[] | null {
  if (userId === undefined || !cache) {
    return null;
  }
  return String(cache.userId) === String(userId) ? cache.teams : null;
}

export function useLedTeams(): Team[] | null {
  const { user } = useAuth();
  const userId = user?.id;
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (userId === undefined || cachedValue(userId) !== null) {
      return;
    }

    let active = true;
    fetchLedTeams()
      .then((teams) => {
        cache = { userId, teams };
      })
      .catch(() => {
        cache = { userId, teams: [] };
      })
      .finally(() => {
        if (active) {
          forceRender((n) => n + 1);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return cachedValue(userId);
}
