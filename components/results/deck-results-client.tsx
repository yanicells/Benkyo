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
      <header className="rounded-2xl border border-rose-900/10 bg-white/70 p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-rose-700">
          Session complete
        </p>
        <h2 className="mt-2 font-display text-3xl text-slate-900">
          {lessonTitle}
        </h2>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-700">
          <span>{results.totalReviewed} cards reviewed</span>
          <span>{accuracy}% accuracy</span>
          <span>
            {minutes > 0 ? `${minutes}m ` : ""}
            {seconds}s
          </span>
        </div>
        <p className="mt-2 text-slate-700">
          {results.wrongCards.length === 0
            ? "Perfect run. You did not miss any cards this time."
            : `Cards missed at least once: ${results.wrongCards.length}`}
        </p>
      </header>

      {results.wrongCards.length > 0 && (
        <ul className="grid gap-3">
          {results.wrongCards.map((card, i) => (
            <li
              key={`${card.front}-${card.back}-${i}`}
              className="rounded-2xl border border-rose-900/10 bg-white p-4"
            >
              <div className="flex items-start gap-2">
                <span className="shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-700">
                  {card.type}
                </span>
                <div>
                  <p className="font-display text-2xl text-slate-900">
                    {card.front}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{card.back}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-3">
        <Link
          href={isReview ? "/" : "/decks"}
          className="rounded-full border border-rose-900/20 px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-rose-800 transition hover:border-rose-900/40 hover:bg-rose-100"
        >
          {isReview ? "Home" : "Back to decks"}
        </Link>
        <Link
          href={
            isReview
              ? "/review"
              : `/decks/${lessonId}/${subDeckId}`
          }
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-700"
        >
          {isReview ? "Review again" : "Restart deck"}
        </Link>
      </div>
    </section>
  );
}
