"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useSession } from "@/lib/auth-client";
import {
  getAllSRS,
  getAllDailyStats,
  getStreak,
  getSettings,
} from "@/lib/srs";

type SyncState = "idle" | "syncing" | "done" | "error";

type AuthContextValue = {
  isSignedIn: boolean;
  user: { name: string; email: string; image?: string | null } | null;
  syncState: SyncState;
  triggerSync: () => Promise<void>;
  hasMigratable: boolean;
  uploadLocalData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  isSignedIn: false,
  user: null,
  syncState: "idle",
  triggerSync: async () => {},
  hasMigratable: false,
  uploadLocalData: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const MIGRATED_KEY = "benkyo-migrated-to-db";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [hasMigratable, setHasMigratable] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const didAutoSync = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isSignedIn = hydrated && !!session?.user;
  const user = hydrated && session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null;

  // On sign-in, check if there's local data that hasn't been migrated yet
  useEffect(() => {
    if (!hydrated || !isSignedIn || isPending) return;
    const alreadyMigrated = localStorage.getItem(MIGRATED_KEY);
    if (alreadyMigrated) return;

    const srs = getAllSRS();
    const hasData = Object.keys(srs).length > 0;
    setHasMigratable(hasData);
  }, [hydrated, isSignedIn, isPending]);

  // After sign-in, do a download sync to pull latest server data into localStorage
  useEffect(() => {
    if (!hydrated || !isSignedIn || isPending || didAutoSync.current) return;
    didAutoSync.current = true;

    const pullFromServer = async () => {
      try {
        const res = await fetch("/api/sync");
        if (!res.ok) return;
        const data = await res.json();

        // Import server data using the same merge logic as importData()
        const { importData } = await import("@/lib/srs");
        importData(JSON.stringify(data));
      } catch {
        // Fail silently — localStorage is still valid
      }
    };

    void pullFromServer();
  }, [hydrated, isSignedIn, isPending]);

  const uploadLocalData = useCallback(async () => {
    setSyncState("syncing");
    try {
      const payload = {
        srs: getAllSRS(),
        dailyStats: getAllDailyStats(),
        streak: getStreak(),
        settings: getSettings(),
      };
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Sync failed");
      localStorage.setItem(MIGRATED_KEY, "1");
      setHasMigratable(false);
      setSyncState("done");
    } catch {
      setSyncState("error");
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!isSignedIn) return;
    setSyncState("syncing");
    try {
      const payload = {
        srs: getAllSRS(),
        dailyStats: getAllDailyStats(),
        streak: getStreak(),
        settings: getSettings(),
      };
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSyncState("done");
      // Reset state after brief feedback delay
      setTimeout(() => setSyncState("idle"), 2000);
    } catch {
      setSyncState("error");
    }
  }, [isSignedIn]);

  return (
    <AuthContext.Provider
      value={{ isSignedIn, user, syncState, triggerSync, hasMigratable, uploadLocalData }}
    >
      {children}
    </AuthContext.Provider>
  );
}
