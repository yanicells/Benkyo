"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
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

const DIFFICULTY_LABELS: Record<ReadingDifficulty, string> = {
  simple: "Beginner",
  intermediate: "Intermediate",
  hard: "Hard",
};

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

  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 pt-0 pb-32 sm:px-8 sm:pt-10 sm:pb-36">
      {/* Back button */}
      <div className="sticky top-14 lg:top-16 z-20 -mx-4 sm:-mx-8 mb-6 border-b border-outline-variant/10 bg-surface/95 px-4 py-3 backdrop-blur-md sm:px-8">
        <Link
          href={`/reading/${difficulty}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {DIFFICULTY_LABELS[difficulty]} Stories
        </Link>
      </div>

      {/* Header */}
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-on-surface-variant mb-2">
          Story
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">
          {story.title}
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          {story.passages.length}{" "}
          {story.passages.length === 1 ? "passage" : "passages"} ·{" "}
          {story.questions.length}{" "}
          {story.questions.length === 1 ? "question" : "questions"}
        </p>
      </header>

      {/* Progress card */}
      {progress && (
        <div className="mb-8 rounded-2xl bg-surface-lowest p-5 shadow-[0_8px_28px_rgba(0,36,70,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Your Progress
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-primary">Best Score</span>
                <span className="text-on-surface-variant">
                  {progress.bestScore}/{progress.totalQuestions} (
                  {Math.round(
                    (progress.bestScore / progress.totalQuestions) * 100,
                  )}
                  %)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary-container overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.round((progress.bestScore / progress.totalQuestions) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div
              key={i}
              className="rounded-lg bg-surface-low px-3 py-2"
            >
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
    </section>
  );
}
