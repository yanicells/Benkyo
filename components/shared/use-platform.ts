"use client";

import { useState, useEffect } from "react";

export type Platform = "ios" | "android" | "desktop-chromium" | "desktop-other";

export type PlatformInfo = {
  platform: Platform;
  isStandalone: boolean;
};

export function usePlatform(): PlatformInfo | null {
  const [info, setInfo] = useState<PlatformInfo | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    const isIos =
      /iPhone|iPad|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const isAndroid = /Android/.test(ua);

    const isChromium =
      !isIos &&
      !isAndroid &&
      ("chrome" in window || /Chrome|Chromium|Edg/.test(ua));

    let platform: Platform;
    if (isIos) platform = "ios";
    else if (isAndroid) platform = "android";
    else if (isChromium) platform = "desktop-chromium";
    else platform = "desktop-other";

    setInfo({ platform, isStandalone });
  }, []);

  return info;
}
