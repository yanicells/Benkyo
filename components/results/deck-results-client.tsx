"use client";

import { useState } from "react";
import Link from "next/link";

import type { Card } from "@/lib/types";

type DeckResultsClientProps = {
  lessonId: string;
  lessonTitle: string;
};

export function DeckResultsClient({ lessonId, lessonTitle }: DeckResultsClientProps) {
  const [wrongCards] = useState<Card[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.sessionStorage.getItem(`deck-results:${lessonId}`);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw) as Card[];
    } catch {
      return [];
    }
  });

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-rose-900/10 bg-white/70 p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-rose-700">Session complete</p>
        <h2 className="mt-2 font-display text-3xl text-slate-900">{lessonTitle}</h2>
        <p className="mt-2 text-slate-700">
          {wrongCards.length === 0
            ? "Perfect run. You did not miss any cards this time."
            : `Cards missed at least once: ${wrongCards.length}`}
        </p>
      </header>

      {wrongCards.length > 0 ? (
        <ul className="grid gap-3">
          {wrongCards.map((card) => (
            <li
              key={`${card.front}-${card.back}`}
              className="rounded-2xl border border-rose-900/10 bg-gradient-to-r from-rose-50 to-amber-50 p-4"
            >
              <p className="font-display text-2xl text-slate-900">{card.front}</p>
              <p className="mt-1 text-sm text-slate-700">{card.back}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/decks"
          className="rounded-full border border-rose-900/20 px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-rose-800 transition hover:border-rose-900/40 hover:bg-rose-100"
        >
          Back to decks
        </Link>
        <Link
          href={`/decks/${lessonId}`}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-700"
        >
          Restart deck
        </Link>
      </div>
    </section>
  );
}
