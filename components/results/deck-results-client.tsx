"use client";

import { useState } from "react";
import Link from "next/link";

import type { Card } from "@/lib/types";

type ResultsData = {
  wrongCards: Card[];
  totalReviewed: number;
  totalCorrect: number;
  timeSeconds: number;
};

type DeckResultsClientProps = {
  lessonId: string;
  subDeckId: string;
  lessonTitle: string;
  isReview?: boolean;
};

function hasLatinText(value: string): boolean {
  return /[A-Za-z]/.test(value);
}

export function DeckResultsClient({
  lessonId,
  subDeckId,
  lessonTitle,
  isReview = false,
}: DeckResultsClientProps) {
  const [results] = useState<ResultsData>(() => {
    if (typeof window === "undefined") {
      return { wrongCards: [], totalReviewed: 0, totalCorrect: 0, timeSeconds: 0 };
    }

    try {
      const key = isReview
        ? "deck-results:review:review"
        : `deck-results:${lessonId}:${subDeckId}`;
      const raw = window.sessionStorage.getItem(key);
      if (!raw) {
        return { wrongCards: [], totalReviewed: 0, totalCorrect: 0, timeSeconds: 0 };
      }
      return JSON.parse(raw) as ResultsData;
    } catch {
      return { wrongCards: [], totalReviewed: 0, totalCorrect: 0, timeSeconds: 0 };
    }
  });

  const accuracy =
    results.totalReviewed > 0
      ? Math.round((results.totalCorrect / results.totalReviewed) * 100)
      : 100;

  const minutes = Math.floor(results.timeSeconds / 60);
  const seconds = results.timeSeconds % 60;

  return (
    <section className="space-y-6">
      <header className="rounded-lg bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">
          Session complete
        </p>
        <h2 className="mt-2 font-display text-3xl text-foreground">
          {lessonTitle}
        </h2>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-on-surface-variant">
          <span>{results.totalReviewed} cards reviewed</span>
          <span>{accuracy}% accuracy</span>
          <span>
            {minutes > 0 ? `${minutes}m ` : ""}
            {seconds}s
          </span>
        </div>
        <p className="mt-2 text-on-surface-variant">
          {results.wrongCards.length === 0
            ? "Perfect run. You did not miss any cards this time."
            : `Cards missed at least once: ${results.wrongCards.length}`}
        </p>
      </header>

      {results.wrongCards.length > 0 && (
        <section className="rounded-2xl bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.22em] text-primary font-bold">
              Cards to review
            </p>
            <p className="text-xs text-on-surface-variant">
              {results.wrongCards.length} entries
            </p>
          </div>
          <ul className="space-y-2">
            {results.wrongCards.map((card, i) => (
              <li
                key={`${card.front}-${card.back}-${i}`}
                className="flex items-center gap-2 rounded-lg bg-surface-low px-3 py-2"
              >
                <span className="inline-flex h-6 w-24 shrink-0 items-center justify-center rounded-lg bg-surface-lowest px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  {card.type}
                </span>
                <div className="min-w-0">
                  <p
                    className={`${hasLatinText(card.front) ? "font-display text-lg" : "font-japanese text-xl"} font-medium text-foreground`}
                  >
                    {card.front}
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {card.back}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link
          href={isReview ? "/" : "/decks"}
          className="w-full rounded-lg bg-surface-low px-5 py-2 text-center text-sm font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-secondary-container"
        >
          {isReview ? "Home" : "Back to decks"}
        </Link>
        <Link
          href={
            isReview
              ? "/review"
              : `/decks/${lessonId}/${subDeckId}`
          }
          className="btn-primary-gradient w-full rounded-lg px-5 py-2 text-center text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:opacity-90"
        >
          {isReview ? "Review again" : "Restart deck"}
        </Link>
      </div>
    </section>
  );
}
