"use client";

import { useState, useEffect } from "react";
import { getDeferredInstallPrompt, clearDeferredInstallPrompt } from "./pwa-init";

const DISMISSED_KEY = "benkyo-install-dismissed";

export function InstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    const onInstallable = () => setVisible(true);
    window.addEventListener("pwa-installable", onInstallable);

    // If already captured before mount
    if (getDeferredInstallPrompt()) setVisible(true);

    return () => window.removeEventListener("pwa-installable", onInstallable);
  }, []);

  const onInstall = async () => {
    const prompt = getDeferredInstallPrompt() as (Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: string }> }) | null;
    if (!prompt?.prompt) return;
    await prompt.prompt();
    const { outcome } = await (prompt.userChoice ?? Promise.resolve({ outcome: "dismissed" }));
    if (outcome === "accepted") {
      clearDeferredInstallPrompt();
    }
    setVisible(false);
  };

  const onDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm">
      <div className="rounded-xl bg-primary text-white shadow-[0_8px_32px_rgba(0,36,70,0.4)] flex items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Install Benkyo</p>
          <p className="text-[11px] text-white/70 mt-0.5">Study offline, anytime</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onInstall}
            className="rounded-lg bg-white/20 hover:bg-white/30 transition px-3 py-1.5 text-xs font-semibold"
          >
            Install
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss install prompt"
            className="rounded-lg p-1.5 hover:bg-white/15 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
