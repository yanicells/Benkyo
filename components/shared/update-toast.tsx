"use client";

import { useState, useEffect } from "react";

export function UpdateToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onUpdate = () => setVisible(true);
    window.addEventListener("sw-update-available", onUpdate);
    return () => window.removeEventListener("sw-update-available", onUpdate);
  }, []);

  const onRefresh = () => {
    // Tell the waiting SW to take over, then the controllerchange listener in pwa-init will reload
    navigator.serviceWorker?.controller?.postMessage({ type: "SKIP_WAITING" });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:max-w-sm">
      <div className="rounded-xl bg-primary-container text-foreground shadow-[0_8px_32px_rgba(0,36,70,0.2)] border border-primary/20 flex items-center gap-3 px-4 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p className="flex-1 text-xs text-foreground">New version available</p>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-container hover:text-primary transition"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss update"
          className="rounded-lg p-1.5 hover:bg-secondary-container transition"
        >
          <svg className="w-3.5 h-3.5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
