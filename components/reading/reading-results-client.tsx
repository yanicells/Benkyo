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
      <div className="min-h-dvh bg-surface flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">No results found.</p>
          <Link
            href={`/reading/${difficulty}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Back to stories
          </Link>
        </div>
      </div>
    );
  }

  const pct =
    results.totalQuestions > 0
      ? Math.round((results.score / results.totalQuestions) * 100)
      : 0;
  const isPerfect = pct === 100;

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg text-center">
          <div className="bg-surface-lowest rounded-3xl p-8 md:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)]">
            <div className="mb-6">
              <span
                className="font-japanese-display text-5xl md:text-6xl text-primary/20 block mb-4"
                aria-hidden
              >
                {isPerfect ? "\u5B8C" : "\u8AAD"}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {isPerfect ? "Perfect Score!" : "Story Complete"}
              </h2>
              <p className="text-sm text-secondary mt-2">{results.storyTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-low rounded-2xl p-4">
                <p className="font-display text-3xl font-extrabold text-foreground">
                  {results.passagesRead}
                </p>
                <p className="text-xs text-secondary uppercase font-bold tracking-wider mt-1">
                  Passages Read
                </p>
              </div>
              <div className="bg-surface-low rounded-2xl p-4">
                <p className="font-display text-3xl font-extrabold text-foreground">
                  {pct}%
                </p>
                <p className="text-xs text-secondary uppercase font-bold tracking-wider mt-1">
                  Accuracy
                </p>
              </div>
            </div>

            <p className="text-sm text-secondary mb-8">
              {results.score} of {results.totalQuestions} questions correct
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href={`/reading/${difficulty}/${storyId}/session`}
                className="btn-primary-gradient text-white font-bold py-3 px-6 rounded-xl shadow-[0_8px_24px_rgba(0,36,70,0.12)] hover:opacity-90 transition text-center"
              >
                Try Again
              </Link>
              <Link
                href={`/reading/${difficulty}`}
                className="text-sm font-semibold text-primary hover:underline py-2"
              >
                Back to {DIFFICULTY_LABELS[difficulty]} Stories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
