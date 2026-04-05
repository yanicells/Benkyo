"use client";

import { useRef, useState } from "react";

import Link from "next/link";

import {
  exportAllData,
  getSettings,
  importData,
  resetAllProgress,
  saveSettings,
} from "@/lib/srs";
import { signIn, signOut } from "@/lib/auth-client";
import { useAuth } from "@/components/shared/auth-provider";

type SettingsModalProps = {
  onClose: () => void;
};

const goalOptions = [10, 20, 30, 50];

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState(() => getSettings());
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isStandalone] = useState(() => {
    if (typeof window === "undefined") return true;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const { isSignedIn, user, syncState, triggerSync } = useAuth();

  const handleGoalChange = (goal: number) => {
    const updated = { ...settings, dailyGoal: goal };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `benkyo-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(reader.result as string);
        setImportStatus("Progress imported successfully.");
      } catch {
        setImportStatus("Invalid file. Import failed.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetAllProgress();
    onClose();
    window.location.reload();
  };

  return (
    // Outer: fixed overlay covering the entire viewport at z-50
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settings and data"
    >
      {/* No backdrop — click outside the panel to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      {/* Modal panel — solid surface, no transparency */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-surface-lowest shadow-[0_32px_80px_rgba(0,36,70,0.22)] border border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/15">
          <p className="text-xs uppercase tracking-[0.22em] font-bold text-primary">
            Settings & Data
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Daily goal */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Daily goal
            </p>
            <div className="flex gap-2">
              {goalOptions.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalChange(goal)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    settings.dailyGoal === goal
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-low text-on-surface-variant hover:bg-secondary-container"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-on-surface-variant">
              cards per day target — shown in the daily goal ring on Home
            </p>
          </div>

          {/* Export / Import */}
          <div className="border-t border-outline-variant/15 pt-5">
            <p className="text-sm font-semibold text-foreground mb-3">Data</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="rounded-lg bg-surface-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-secondary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Export progress
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="rounded-lg bg-surface-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-secondary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Import progress
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                onChange={onFileChange}
                className="hidden"
              />
            </div>
            {importStatus && (
              <p className="mt-2 text-xs text-on-surface-variant">{importStatus}</p>
            )}
          </div>

          {/* Account / Sync */}
          <div className="border-t border-outline-variant/15 pt-5">
            <p className="text-sm font-semibold text-foreground mb-3">Account & Sync</p>
            {isSignedIn && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-surface-low p-3">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={triggerSync}
                    disabled={syncState === "syncing"}
                    className="flex-1 rounded-lg bg-surface-low px-3 py-2 text-xs font-semibold text-primary hover:bg-secondary-container transition disabled:opacity-50"
                  >
                    {syncState === "syncing" ? "Syncing…" : syncState === "done" ? "Synced ✓" : "Sync now"}
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="rounded-lg bg-surface-low px-3 py-2 text-xs font-semibold text-on-surface-variant hover:bg-secondary-container transition"
                  >
                    Sign out
                  </button>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Progress syncs automatically across devices when signed in.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    signIn.social({ provider: "google", callbackURL: "/stats" })
                  }
                  className="flex w-full items-center gap-3 rounded-lg border border-outline-variant/40 bg-surface-lowest px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-low transition"
                >
                  {/* Google icon */}
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <p className="text-[11px] text-on-surface-variant">
                  Sign in to sync your progress across devices. The app works fully without an account.
                </p>
              </div>
            )}
          </div>

          {/* Install app */}
          {!isStandalone && (
            <div className="border-t border-outline-variant/15 pt-5">
              <p className="text-sm font-semibold text-foreground mb-3">Install app</p>
              <Link
                href="/install"
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg bg-surface-low px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary-container transition-colors"
              >
                <svg className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
                Install Benkyo on your device
              </Link>
              <p className="mt-2 text-[11px] text-on-surface-variant">
                Add to your home screen for offline access and a native app experience.
              </p>
            </div>
          )}

          {/* Reset */}
          <div className="border-t border-outline-variant/15 pt-5">
            <p className="text-sm font-semibold text-foreground mb-3">
              Danger zone
            </p>
            <button
              type="button"
              onClick={handleReset}
              className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                confirmReset
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "border border-red-300 text-red-700 hover:bg-red-50"
              }`}
            >
              {confirmReset
                ? "Confirm — all progress will be lost"
                : "Reset all progress"}
            </button>
            {confirmReset && (
              <p className="mt-2 text-xs text-red-600">
                This cannot be undone. Click again to confirm.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
