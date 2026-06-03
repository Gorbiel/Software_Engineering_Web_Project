"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchMyProfile, type UserProfile } from "@/utils/profile";

type MyProfileContextValue = {
  profile: UserProfile | null;
  error: string | null;
  setProfile: (profile: UserProfile) => void;
  refresh: () => void;
};

const MyProfileContext = createContext<MyProfileContextValue | null>(null);

export function MyProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetchMyProfile()
      .then((data) => {
        setProfile(data);
        setError(null);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Couldn't load profile.",
        );
      });
  }, []);

  useEffect(() => {
    if (userId === undefined) {
      return;
    }

    let active = true;
    fetchMyProfile()
      .then((data) => {
        if (active) {
          setProfile(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Couldn't load profile.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <MyProfileContext.Provider value={{ profile, error, setProfile, refresh }}>
      {children}
    </MyProfileContext.Provider>
  );
}

export function useMyProfile(): MyProfileContextValue {
  const ctx = useContext(MyProfileContext);
  if (!ctx) {
    throw new Error("useMyProfile must be used inside MyProfileProvider");
  }
  return ctx;
}
