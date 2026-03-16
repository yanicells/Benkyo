"use client";

import { useEffect } from "react";

export function PwaInit() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Silent fail keeps hydration and navigation unaffected.
      }
    };

    void register();
  }, []);

  return null;
}
