"use client";

import { useEffect } from "react";

// Broadcast install prompt and SW update events to the app
let deferredInstallPrompt: Event | null = null;

export function getDeferredInstallPrompt() {
  return deferredInstallPrompt;
}

export function clearDeferredInstallPrompt() {
  deferredInstallPrompt = null;
}

export function PwaInit() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // In development, stale SW caches can cause hydration mismatches.
    // Clean up any previous registrations/caches and skip registration.
    if (process.env.NODE_ENV !== "production") {
      void (async () => {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((reg) => reg.unregister()));

          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(
              keys
                .filter((key) => key.startsWith("benkyo-"))
                .map((key) => caches.delete(key)),
            );
          }
        } catch {
          // Silent fail — keep hydration and navigation unaffected
        }
      })();

      return;
    }

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Detect SW updates — fire a custom event so UI can show a toast
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              window.dispatchEvent(new CustomEvent("sw-update-available"));
            }
          });
        });

        // When a new SW takes control, reload to get the latest assets
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      } catch {
        // Silent fail — keep hydration and navigation unaffected
      }
    };

    void register();

    // Capture install prompt so InstallBanner can trigger it
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      window.dispatchEvent(new CustomEvent("pwa-installable"));
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  return null;
}
