"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ReadingDifficulty } from "@/lib/types";

type ResultsData = {
  storyTitle: string;
  passagesRead: number;
  score: number;
  totalQuestions: number;
};

type ReadingResultsClientProps = {
  difficulty: ReadingDifficulty;
  storyId: string;
};

const DIFFICULTY_LABELS: Record<ReadingDifficulty, string> = {
  simple: "Beginner",
  intermediate: "Intermediate",
  hard: "Hard",
};

function readResultsFromSession(
  difficulty: string,
  storyId: string,
): ResultsData | null {
  try {
    const key = `reading-results:${difficulty}:${storyId}`;
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ResultsData) : null;
  } catch {
    return null;
  }
}

export function ReadingResultsClient({
  difficulty,
  storyId,
}: ReadingResultsClientProps) {
  const results = useMemo(
    () => readResultsFromSession(difficulty, storyId),
    [difficulty, storyId],
  );

  if (!results) {
    return (
      <section className="space-y-6">
        <div className="rounded-lg bg-surface-lowest p-5 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
          <p className="mb-4 text-on-surface-variant">No results found.</p>
          <Link
            href={`/reading/${difficulty}`}
            className="inline-flex rounded-lg border border-primary/45 bg-surface-lowest px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-primary/5"
          >
            Back to Stories
          </Link>
        </div>
      </section>
    );
  }

  const pct =
    results.totalQuestions > 0
      ? Math.round((results.score / results.totalQuestions) * 100)
      : 0;
  const isPerfect = pct === 100 && results.totalQuestions > 0;

  const statusText =
    results.totalQuestions === 0
      ? "Reading complete. No quiz questions in this session."
      : isPerfect
        ? "Perfect run. You answered every question correctly."
        : `Questions missed: ${Math.max(0, results.totalQuestions - results.score)}`;

  return (
    <section className="space-y-6">
      <header className="rounded-lg bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">
          Session complete
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-foreground">
          {results.storyTitle}
        </h2>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-on-surface-variant">
          <span>{results.passagesRead} passages read</span>
          <span>
            {results.score}/{results.totalQuestions} correct
          </span>
          <span>{pct}% accuracy</span>
        </div>
        <p className="mt-2 text-on-surface-variant">{statusText}</p>
      </header>

      <section className="rounded-2xl bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Performance
          </p>
          <p className="text-xs text-on-surface-variant">
            {DIFFICULTY_LABELS[difficulty]}
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-surface-low px-3 py-2">
              <p className="text-xs uppercase tracking-[0.12em] text-on-surface-variant">
                Passages
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">
                {results.passagesRead}
              </p>
            </div>
            <div className="rounded-lg bg-surface-low px-3 py-2">
              <p className="text-xs uppercase tracking-[0.12em] text-on-surface-variant">
                Accuracy
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">
                {pct}%
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Score</span>
              <span>
                {results.score}/{results.totalQuestions}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary-container">
              <div
                className="h-full rounded-full bg-success transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/reading/${difficulty}`}
          className="w-full rounded-lg border border-primary/45 bg-surface-lowest px-5 py-2 text-center text-sm font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-primary/5"
        >
          Back to stories
        </Link>
        <Link
          href={`/reading/${difficulty}/${storyId}/session`}
          className="btn-primary-gradient w-full rounded-lg px-5 py-2 text-center text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:opacity-90"
        >
          Read again
        </Link>
      </div>
    </section>
  );
}
