"use client";

import { useState, useEffect, useCallback } from "react";
import { getDeferredInstallPrompt, clearDeferredInstallPrompt } from "./pwa-init";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function useInstallPrompt() {
  const [canPrompt, setCanPrompt] = useState(false);

  useEffect(() => {
    if (getDeferredInstallPrompt()) setCanPrompt(true);

    const onInstallable = () => setCanPrompt(true);
    window.addEventListener("pwa-installable", onInstallable);
    return () => window.removeEventListener("pwa-installable", onInstallable);
  }, []);

  const triggerInstall = useCallback(async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    const prompt = getDeferredInstallPrompt() as BeforeInstallPromptEvent | null;
    if (!prompt?.prompt) return "unavailable";

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") clearDeferredInstallPrompt();
    setCanPrompt(false);
    return outcome;
  }, []);

  return { canPrompt, triggerInstall };
}
