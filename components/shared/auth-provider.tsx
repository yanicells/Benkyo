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
  importData,
  subscribeToStudyData,
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
  const syncedUserRef = useRef<string | null>(null);
  const applyingServerDataRef = useRef(false);
  const uploadInFlightRef = useRef<Promise<void> | null>(null);
  const autoSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncStateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isSignedIn = hydrated && !!session?.user;
  const signedInKey = session?.user?.email ?? null;
  const user = hydrated && session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null;

  const clearAutoSyncTimeout = useCallback(() => {
    if (!autoSyncTimeoutRef.current) return;
    clearTimeout(autoSyncTimeoutRef.current);
    autoSyncTimeoutRef.current = null;
  }, []);

  const clearSyncStateTimeout = useCallback(() => {
    if (!syncStateTimeoutRef.current) return;
    clearTimeout(syncStateTimeoutRef.current);
    syncStateTimeoutRef.current = null;
  }, []);

  const markSynced = useCallback(() => {
    setSyncState("done");
    clearSyncStateTimeout();
    syncStateTimeoutRef.current = setTimeout(() => {
      setSyncState("idle");
      syncStateTimeoutRef.current = null;
    }, 2000);
  }, [clearSyncStateTimeout]);

  const buildPayload = useCallback(() => {
    return {
      srs: getAllSRS(),
      dailyStats: getAllDailyStats(),
      streak: getStreak(),
      settings: getSettings(),
    };
  }, []);

  const uploadToServer = useCallback(async () => {
    if (uploadInFlightRef.current) {
      await uploadInFlightRef.current;
      return;
    }

    const pending = (async () => {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error("Sync upload failed");
    })();

    uploadInFlightRef.current = pending;
    try {
      await pending;
    } finally {
      uploadInFlightRef.current = null;
    }
  }, [buildPayload]);

  const pullFromServer = useCallback(async () => {
    const res = await fetch("/api/sync");
    if (!res.ok) throw new Error("Sync download failed");

    const data = await res.json();
    applyingServerDataRef.current = true;
    try {
      importData(JSON.stringify(data));
    } finally {
      applyingServerDataRef.current = false;
    }
  }, []);

  // On sign-in, check if there's local data that hasn't been migrated yet
  useEffect(() => {
    if (!hydrated || !isSignedIn || isPending) {
      setHasMigratable(false);
      return;
    }
    const alreadyMigrated = localStorage.getItem(MIGRATED_KEY);
    if (alreadyMigrated) {
      setHasMigratable(false);
      return;
    }

    const srs = getAllSRS();
    const hasData = Object.keys(srs).length > 0;
    setHasMigratable(hasData);
  }, [hydrated, isSignedIn, isPending]);

  // Keep provider refs/timers clean across auth state transitions.
  useEffect(() => {
    if (isSignedIn) return;
    syncedUserRef.current = null;
    clearAutoSyncTimeout();
    clearSyncStateTimeout();
    setSyncState("idle");
  }, [isSignedIn, clearAutoSyncTimeout, clearSyncStateTimeout]);

  // Initial signed-in sync (pull first, then upload merged local state).
  useEffect(() => {
    if (!hydrated || !isSignedIn || isPending || !signedInKey) return;
    if (syncedUserRef.current === signedInKey) return;

    syncedUserRef.current = signedInKey;

    const runInitialSync = async () => {
      let hadError = false;
      setSyncState("syncing");

      try {
        await pullFromServer();
      } catch {
        hadError = true;
      }

      try {
        await uploadToServer();
      } catch {
        hadError = true;
      }

      if (hadError) {
        setSyncState("error");
      } else {
        markSynced();
      }
    };

    void runInitialSync();
  }, [
    hydrated,
    isSignedIn,
    isPending,
    signedInKey,
    pullFromServer,
    uploadToServer,
    markSynced,
  ]);

  // Pull latest cloud data when the app regains focus/visibility or reconnects.
  useEffect(() => {
    if (!hydrated || !isSignedIn || isPending) return;

    const pullLatest = () => {
      if (document.visibilityState !== "visible") return;
      void pullFromServer().catch(() => {
        // Leave local data untouched on transient network failures.
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pullLatest();
      }
    };

    const intervalId = setInterval(pullLatest, 60_000);
    window.addEventListener("focus", pullLatest);
    window.addEventListener("online", pullLatest);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", pullLatest);
      window.removeEventListener("online", pullLatest);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [hydrated, isSignedIn, isPending, pullFromServer]);

  // Debounced background upload whenever local study data changes.
  useEffect(() => {
    if (!hydrated || !isSignedIn || isPending) return;

    const schedule = () => {
      if (applyingServerDataRef.current) return;

      clearAutoSyncTimeout();
      autoSyncTimeoutRef.current = setTimeout(() => {
        autoSyncTimeoutRef.current = null;
        if (!isSignedIn) return;
        void uploadToServer().catch(() => {
          setSyncState("error");
        });
      }, 1200);
    };

    return subscribeToStudyData(schedule);
  }, [
    hydrated,
    isSignedIn,
    isPending,
    uploadToServer,
    clearAutoSyncTimeout,
  ]);

  const uploadLocalData = useCallback(async () => {
    if (!isSignedIn) return;
    clearAutoSyncTimeout();
    setSyncState("syncing");
    try {
      await uploadToServer();
      await pullFromServer();
      localStorage.setItem(MIGRATED_KEY, "1");
      setHasMigratable(false);
      markSynced();
    } catch {
      setSyncState("error");
    }
  }, [
    isSignedIn,
    uploadToServer,
    pullFromServer,
    markSynced,
    clearAutoSyncTimeout,
  ]);

  const triggerSync = useCallback(async () => {
    if (!isSignedIn) return;
    clearAutoSyncTimeout();
    setSyncState("syncing");
    try {
      await uploadToServer();
      await pullFromServer();
      markSynced();
    } catch {
      setSyncState("error");
    }
  }, [
    isSignedIn,
    uploadToServer,
    pullFromServer,
    markSynced,
    clearAutoSyncTimeout,
  ]);

  useEffect(() => {
    return () => {
      clearAutoSyncTimeout();
      clearSyncStateTimeout();
    };
  }, [clearAutoSyncTimeout, clearSyncStateTimeout]);

  return (
    <AuthContext.Provider
      value={{ isSignedIn, user, syncState, triggerSync, hasMigratable, uploadLocalData }}
    >
      {children}
    </AuthContext.Provider>
  );
}
