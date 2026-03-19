"use client";

import Link from "next/link";
import { useState } from "react";

import type { CardType, Lesson } from "@/lib/types";
import { getMasteryPercent, getSubDeckAccuracy } from "@/lib/srs";

type SubDeckGridProps = {
  lesson: Lesson;
};

const typeIcons: Record<CardType, string> = {
  vocab: "語",
  grammar: "文",
  "fill-in": "✎",
  conjugation: "変",
  translate: "訳",
  culture: "文化",
};

function getDeckPrimaryType(cards: { type: CardType }[]): CardType {
  const counts: Partial<Record<CardType, number>> = {};
  for (const card of cards) {
    counts[card.type] = (counts[card.type] ?? 0) + 1;
  }
  let max: CardType = "vocab";
  let maxCount = 0;
  for (const [type, count] of Object.entries(counts)) {
    if (count > maxCount) {
      max = type as CardType;
      maxCount = count;
    }
  }
  return max;
}

type SubDeckStats = Record<string, { mastery: number; accuracy: number }>;

export function SubDeckGrid({ lesson }: SubDeckGridProps) {
  const [stats] = useState<SubDeckStats>(() => {
    if (typeof window === "undefined") return {};
    const result: SubDeckStats = {};
    for (const sd of lesson.subDecks) {
      result[sd.id] = {
        mastery: getMasteryPercent(sd.id, sd.cards.length),
        accuracy: getSubDeckAccuracy(sd.id, sd.cards.length),
      };
    }
    return result;
  });

  return (
    <section className="space-y-4">
      <Link
        href={`/decks/${lesson.id}/all`}
        className="block rounded-2xl border border-rose-900/10 bg-rose-50/50 p-4 text-center transition hover:-translate-y-0.5 hover:border-rose-700/30"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.15em] text-rose-800">
          Study all sub-decks
        </span>
      </Link>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lesson.subDecks.map((subDeck) => {
          const primaryType = getDeckPrimaryType(subDeck.cards);
          const mastery = stats[subDeck.id]?.mastery ?? 0;
          const accuracy = stats[subDeck.id]?.accuracy ?? 0;

          return (
            <Link
              key={subDeck.id}
              href={`/decks/${lesson.id}/${subDeck.id}`}
              className="group rounded-2xl border border-rose-900/10 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-700/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
                    {subDeck.cards.length} cards
                  </p>
                  <h3 className="mt-1 truncate font-display text-xl text-slate-900">
                    {subDeck.title}
                  </h3>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-sm text-rose-800">
                  {typeIcons[primaryType]}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                <span>{mastery}% mastered</span>
                {accuracy > 0 && <span>&middot; {accuracy}% accuracy</span>}
              </div>

              <div className="mt-2 h-1 overflow-hidden rounded-full bg-rose-100">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${mastery}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
