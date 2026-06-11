"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { checkIsAdmin } from "@/utils/admin";

let cache: { userId: string | number; value: boolean } | null = null;

function cachedValue(userId: string | number | undefined): boolean | null {
  if (userId === undefined || !cache) {
    return null;
  }
  return String(cache.userId) === String(userId) ? cache.value : null;
}

export function useIsAdmin(): boolean | null {
  const { user } = useAuth();
  const userId = user?.id;
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (userId === undefined || cachedValue(userId) !== null) {
      return;
    }

    let active = true;
    checkIsAdmin()
      .then((value) => {
        cache = { userId, value };
      })
      .catch(() => {
        cache = { userId, value: false };
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
