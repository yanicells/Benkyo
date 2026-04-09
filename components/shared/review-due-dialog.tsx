"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";

import lessonsData from "@/data/lessons.json";
import {
  getDueCards,
  getStudyDataRevision,
  subscribeToStudyData,
} from "@/lib/srs";
import type { LessonsData } from "@/lib/types";

const lessons = (lessonsData as unknown as LessonsData).lessons;

function shouldHideReviewDialog(pathname: string): boolean {
  if (pathname.includes("/session") || pathname.includes("/results"))
    return true;
  if (pathname.startsWith("/review")) return true;
  if (pathname.startsWith("/install") || pathname.startsWith("/legal"))
    return true;

  // Hide on pages that already have a fixed bottom CTA to avoid stacked actions.
  const hasDeckStickyCta = /^\/decks\/[^/]+(?:\/[^/]+)?$/.test(pathname);
  const hasKanaStickyCta = pathname === "/kana";
  const hasReadingStoryStickyCta = /^\/reading\/[^/]+\/[^/]+$/.test(pathname);

  if (hasDeckStickyCta || hasKanaStickyCta || hasReadingStoryStickyCta) {
    return true;
  }

  return false;
}

export function ReviewDueDialog() {
  const pathname = usePathname();
  const dataRevision = useSyncExternalStore(
    subscribeToStudyData,
    getStudyDataRevision,
    () => -1,
  );

  const dueCount = useMemo(() => {
    if (dataRevision < 0) return 0;
    return getDueCards(lessons).length;
  }, [dataRevision]);

  if (shouldHideReviewDialog(pathname) || dueCount <= 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-30 lg:bottom-6 lg:right-6">
      <Link
        href="/review"
        className="pointer-events-auto btn-primary-gradient inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/15 px-4 py-2.5 text-white shadow-[0_14px_30px_rgba(0,36,70,0.3)] transition hover:opacity-90"
        aria-label={`Start review, ${dueCount} ${dueCount === 1 ? "card" : "cards"} due`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span className="text-sm font-bold tracking-[0.04em]">
          {dueCount} {dueCount === 1 ? "card" : "cards"} due
        </span>
      </Link>
    </div>
  );
}
