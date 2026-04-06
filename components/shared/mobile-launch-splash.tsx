"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function MobileLaunchSplash() {
  const [show, setShow] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const TOTAL_DURATION_MS = 1500;
    const FADE_OUT_START_MS = 1200;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (isDesktop) {
      const hideTimer = window.setTimeout(() => setShow(false), 0);
      return () => window.clearTimeout(hideTimer);
    }

    if (reduceMotion) {
      const hideTimer = window.setTimeout(() => setShow(false), 250);
      return () => window.clearTimeout(hideTimer);
    }

    const frame = window.requestAnimationFrame(() => {
      setContentVisible(true);
    });

    const fadeTimer = window.setTimeout(
      () => setFadingOut(true),
      FADE_OUT_START_MS,
    );
    const hideTimer = window.setTimeout(
      () => setShow(false),
      TOTAL_DURATION_MS,
    );

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-white transition-opacity duration-200 lg:hidden ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden
    >
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-200 ${
          contentVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-1 opacity-0"
        }`}
      >
        <Image
          src="/icon1-192.svg"
          alt="Benkyō"
          width={56}
          height={56}
          priority
          className="h-14 w-14"
        />
        <p className="font-display text-[1.65rem] font-bold tracking-tight text-primary">
          Benkyō
        </p>
      </div>
    </div>
  );
}
