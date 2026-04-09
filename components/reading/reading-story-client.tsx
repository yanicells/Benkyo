"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { ReadingDifficulty, ReadingStory } from "@/lib/types";
import {
  subscribeToReadingProgress,
  getReadingProgressRevision,
  getAllReadingProgress,
} from "@/lib/reading-progress";

type ReadingStoryClientProps = {
  story: ReadingStory;
  difficulty: ReadingDifficulty;
};

const subscribeNoop = () => () => {};

export function ReadingStoryClient({
  story,
  difficulty,
}: ReadingStoryClientProps) {
  const router = useRouter();
  const dataRevision = useSyncExternalStore(
    subscribeToReadingProgress,
    getReadingProgressRevision,
    () => -1,
  );
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const progress = useMemo(() => {
    if (!isHydrated || dataRevision < 0) return null;
    const all = getAllReadingProgress();
    return all[story.id] ?? null;
  }, [isHydrated, dataRevision, story.id]);

  const bestScore = progress?.bestScore ?? 0;
  const totalQuestions = story.questions.length;
  const scorePct =
    totalQuestions > 0 ? Math.round((bestScore / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-4 pb-32 sm:space-y-6 sm:pb-36">
      {/* Story progress */}
      <div className="rounded-2xl bg-surface-lowest p-5 shadow-[0_8px_28px_rgba(0,36,70,0.06)]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            Story Progress
          </p>
          <p className="text-[10px] text-on-surface-variant">
            {story.passages.length}{" "}
            {story.passages.length === 1 ? "passage" : "passages"}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-primary">Best Score</span>
              <span className="text-on-surface-variant">
                {bestScore}/{totalQuestions} ({scorePct}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary-container overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${scorePct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-amber-700">Status</span>
            <span className="text-on-surface-variant">
              {progress?.completed
                ? "Completed"
                : progress
                  ? "In progress"
                  : "Not started"}
            </span>
          </div>
        </div>
      </div>

      {/* Passage preview */}
      <div className="rounded-2xl bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.22em] text-primary font-bold">
            Passage Preview
          </p>
          <p className="text-xs text-on-surface-variant">
            {story.passages.length}{" "}
            {story.passages.length === 1 ? "passage" : "passages"}
          </p>
        </div>
        <div className="space-y-2">
          {story.passages.map((p, i) => (
            <div key={i} className="rounded-lg bg-surface-low px-3 py-2">
              <p className="font-japanese text-base text-foreground line-clamp-2">
                {p.passage}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant line-clamp-1">
                {p.translation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-72 z-30 bg-surface/95 backdrop-blur-md border-t border-outline-variant/10">
        <div className="mx-auto w-full max-w-4xl px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-8">
          <button
            type="button"
            onClick={() =>
              router.push(`/reading/${difficulty}/${story.id}/session`)
            }
            className="w-full btn-primary-gradient rounded-xl py-3.5 text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,36,70,0.15)] transition hover:opacity-90"
          >
            {progress?.completed ? "Read Again" : "Begin Reading"}
          </button>
        </div>
      </div>
    </div>
  );
}
