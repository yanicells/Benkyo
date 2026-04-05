"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/shared/auth-provider";
import { signIn, signOut } from "@/lib/auth-client";
import { SettingsModal } from "@/components/stats/settings-modal";

function UserDropdown({
  user,
  syncState,
  triggerSync,
  onClose,
}: {
  user: { name: string; email: string; image?: string | null };
  syncState: string;
  triggerSync: () => Promise<void>;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-surface-lowest border border-outline-variant/20 shadow-[0_16px_48px_rgba(0,36,70,0.18)] overflow-hidden z-50">
      {/* User info header */}
      <div className="px-4 py-3 bg-primary/3 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name} className="h-9 w-9 rounded-full ring-2 ring-primary/20" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="py-1">
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-low transition-colors"
        >
          <svg className="w-4 h-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          View Profile
        </Link>
        <button
          type="button"
          onClick={() => { void triggerSync(); }}
          disabled={syncState === "syncing"}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-low transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {syncState === "syncing" ? "Syncing…" : syncState === "done" ? "Synced ✓" : "Sync progress"}
        </button>
      </div>

      <div className="border-t border-outline-variant/10 py-1">
        <button
          type="button"
          onClick={() => { void signOut(); onClose(); }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-low hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}

export function DesktopHeader() {
  const { isSignedIn, user, syncState, triggerSync } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <>
      <header className="w-full h-16 px-8 flex items-center justify-between bg-surface/90 backdrop-blur-md border-b border-outline-variant/10">

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search cards, lessons…"
            readOnly
            title="Search coming soon"
            className="w-full bg-surface-low rounded-xl py-2 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-on-surface-variant/50 cursor-not-allowed"
          />
        </div>

        {/* Right: settings gear + auth */}
        <div className="flex items-center gap-2 ml-8">
          {/* Settings icon */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors"
            aria-label="Open settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {isSignedIn && user ? (
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-surface-low transition-colors group"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-foreground leading-tight">{user.name.split(" ")[0]}</span>
                  <span className="text-[10px] text-on-surface-variant">synced</span>
                </div>
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full ring-2 ring-transparent group-hover:ring-primary/20 transition-all" />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <svg className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m19 9-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <UserDropdown
                  user={user}
                  syncState={syncState}
                  triggerSync={triggerSync}
                  onClose={() => setDropdownOpen(false)}
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signIn.social({ provider: "google", callbackURL: "/" })}
              className="flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-lowest px-3.5 py-2 text-sm font-medium text-foreground hover:bg-surface-low hover:border-primary/30 transition-all"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in
            </button>
          )}
        </div>
      </header>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
