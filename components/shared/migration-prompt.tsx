"use client";

import { useAuth } from "./auth-provider";

export function MigrationPrompt() {
  const { isSignedIn, hasMigratable, uploadLocalData, syncState } = useAuth();

  if (!isSignedIn || !hasMigratable) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm">
      <div className="rounded-xl bg-surface-lowest border border-primary/20 shadow-[0_8px_32px_rgba(0,36,70,0.15)] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Upload your progress</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
              You have local study data. Upload it to sync across devices?
            </p>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={uploadLocalData}
                disabled={syncState === "syncing"}
                className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {syncState === "syncing" ? "Uploading…" : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Mark as migrated without uploading to dismiss permanently
                  localStorage.setItem("benkyo-migrated-to-db", "skip");
                  window.location.reload();
                }}
                className="rounded-lg bg-surface-low px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-secondary-container transition"
              >
                Skip
              </button>
            </div>
            {syncState === "error" && (
              <p className="text-[10px] text-error mt-1">Upload failed. Try again.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
