import { useCallback, useEffect, useState } from "react";
import { type Achievement, fetchAchievements } from "@/utils/achievements";
import { type Glaze, fetchGlazes } from "@/utils/glazes";

// Loads the achievements and glazes shown on a profile page (own or someone
// else's) and exposes the handlers that keep those lists in sync after
// create/edit/delete. The profile header itself is loaded by the page, since
// the own profile comes from context and other users come from fetchUser.
export function useProfileData(userId: number | string | undefined) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [achievementsError, setAchievementsError] = useState<string | null>(
    null,
  );

  const [glazes, setGlazes] = useState<Glaze[]>([]);
  const [glazesLoading, setGlazesLoading] = useState(true);
  const [glazesError, setGlazesError] = useState<string | null>(null);
  const [glazesGivenCount, setGlazesGivenCount] = useState(0);

  useEffect(() => {
    if (userId === undefined) {
      return;
    }

    let active = true;

    fetchAchievements({ userId })
      .then((data) => {
        if (active) {
          setAchievements(data);
        }
      })
      .catch((err) => {
        if (active) {
          setAchievementsError(
            err instanceof Error ? err.message : "Unable to load achievements.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (userId === undefined) {
      return;
    }

    let active = true;

    Promise.all([
      fetchGlazes({ receivedBy: userId }),
      fetchGlazes({ sentBy: userId }),
    ])
      .then(([received, sent]) => {
        if (active) {
          setGlazes(received);
          setGlazesGivenCount(sent.length);
          setGlazesError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setGlazesError(
            err instanceof Error ? err.message : "Unable to load glazes.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setGlazesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const handleChanged = useCallback((updated: Achievement) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    );
  }, []);

  const handleDeleted = useCallback((id: number) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleGlazeChanged = useCallback((updated: Glaze) => {
    setGlazes((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  }, []);

  const handleGlazeDeleted = useCallback((id: number) => {
    setGlazes((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const handleGlazeCreated = useCallback((created: Glaze) => {
    setGlazes((prev) => [created, ...prev]);
  }, []);

  return {
    achievements,
    isLoading,
    achievementsError,
    handleChanged,
    handleDeleted,
    glazes,
    glazesLoading,
    glazesError,
    glazesGivenCount,
    handleGlazeChanged,
    handleGlazeDeleted,
    handleGlazeCreated,
  };
}
