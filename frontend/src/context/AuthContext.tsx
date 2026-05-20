"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  type AuthUser,
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  logoutRequest,
  subscribeToAuth,
} from "@/utils/auth";

type AuthContextValue = {
  user: AuthUser | null;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const user = useSyncExternalStore(
    subscribeToAuth,
    getStoredUser,
    () => null,
  );

  const logout = useCallback(async () => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    if (access && refresh) {
      try {
        await logoutRequest(refresh, access);
      } catch {
        // proceed with local cleanup even if server logout fails
      }
    }

    clearSession();
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
