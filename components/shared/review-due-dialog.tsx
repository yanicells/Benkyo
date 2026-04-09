"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";

import lessonsData from "@/data/lessons.json";
import { getDueCards, getStudyDataRevision, subscribeToStudyData } from "@/lib/srs";
import type { LessonsData } from "@/lib/types";

const lessons = (lessonsData as unknown as LessonsData).lessons;

function shouldHideReviewDialog(pathname: string): boolean {
  if (pathname.includes("/session") || pathname.includes("/results")) return true;
  if (pathname.startsWith("/review")) return true;
  if (pathname.startsWith("/install") || pathname.startsWith("/legal")) return true;
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
      <div className="pointer-events-auto w-[min(19.5rem,calc(100vw-2rem))] rounded-2xl border border-primary/20 bg-surface-lowest/95 p-3 shadow-[0_12px_32px_rgba(0,36,70,0.2)] backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
          Review Ready
        </p>
        <p className="mt-1 text-sm font-bold text-foreground">
          {dueCount} {dueCount === 1 ? "card" : "cards"} due
        </p>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          Keep momentum with a quick daily review.
        </p>
        <Link
          href="/review"
          className="btn-primary-gradient mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:opacity-90"
        >
          Start Daily Session
        </Link>
      </div>
    </div>
  );
}
